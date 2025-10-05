import {
  Framework,
  BaseFramework,
  HTTP_SERVER_KEY,
  MidwayWebRouterService,
  DecoratorManager,
  MetadataManager,
} from '@midwayjs/core';
import {
  IMidwayMCPApplication,
  IMidwayMCPConfigurationOptions,
  IMidwayMCPContext,
  IMcpResource,
  IMcpTool,
  IMcpPrompt,
} from './interface';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { MCP_TOOL_KEY } from './decorator';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

@Framework()
export class MidwayMCPFramework extends BaseFramework<
  IMidwayMCPApplication,
  IMidwayMCPContext,
  IMidwayMCPConfigurationOptions
> {
  public app: IMidwayMCPApplication;
  protected resourceMap: Map<string, IMcpResource> = new Map();
  protected toolMap: Map<string, IMcpTool> = new Map();
  protected promptMap: Map<string, IMcpPrompt> = new Map();
  protected frameworkLoggerName = 'mcpLogger';
  protected server: McpServer;
  configure() {
    return this.configService.getConfiguration('mcp');
  }

  async applicationInitialize(options) {
    this.app = {} as any;
    const {
      serverInfo,
      serverOptions,
      transportType = 'stdio',
    } = this.configurationOptions;

    this.server = new McpServer(serverInfo, serverOptions);

    // Start receiving messages on stdin and sending messages on stdout
    if (transportType === 'stdio') {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
    } else if (transportType === 'sse') {
      const routerService = this.applicationContext.get(
        MidwayWebRouterService
      );
      // to support multiple simultaneous connections we have a lookup object from
      // sessionId to transport
      const transports: { [sessionId: string]: SSEServerTransport } = {};

      routerService.addRouter(
        async ctx => {
          const transport = new SSEServerTransport('/messages', ctx.res);
          transports[transport.sessionId] = transport;
          ctx.res.on('close', () => {
            delete transports[transport.sessionId];
          });
          await this.server.connect(transport);
        },
        {
          prefix: '/',
          requestMethod: 'GET',
          url: '/sse',
        }
      );

      routerService.addRouter(
        async ctx => {
          const sessionId = ctx.query.sessionId as string;
          const transport = transports[sessionId];
          if (transport) {
            // if (!ctx['auth']) {
            //   ctx.auth = {};
            // }
            await transport.handlePostMessage(ctx, ctx.res, ctx.body);
          } else {
            ctx.res.status(400).send('No transport found for sessionId');
          }
        },
        {
          prefix: '/',
          requestMethod: 'POST',
          url: '/messages',
        }
      );
    } else if (transportType === 'stream-http') {
      const routerService = this.applicationContext.get(
        MidwayWebRouterService
      );
      
      // Map to store transports by session ID
      const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};
      
      // StreamHTTP handler for all HTTP methods (GET, POST, DELETE)
      const streamHttpHandler = async (ctx) => {
        const sessionId = ctx.headers['mcp-session-id'];
        
        try {
          let transport: StreamableHTTPServerTransport;
          
          if (sessionId && transports[sessionId]) {
            // Reuse existing transport
            transport = transports[sessionId];
          } else if (ctx.method === 'POST' && !sessionId) {
            // New initialization request
            transport = new StreamableHTTPServerTransport({
              sessionIdGenerator: () => require('crypto').randomUUID(),
              onsessioninitialized: (sessionId: string) => {
                transports[sessionId] = transport;
              }
            });
            
            // Set up cleanup on close
            transport.onclose = () => {
              const sid = transport.sessionId;
              if (sid && transports[sid]) {
                delete transports[sid];
              }
            };
            
            // Connect to MCP server
            await this.server.connect(transport);
          } else {
            // Invalid request
            ctx.status = 400;
            ctx.body = {
              jsonrpc: '2.0',
              error: {
                code: -32000,
                message: 'Bad Request: No valid session ID provided'
              },
              id: null
            };
            return;
          }
          
          // Ensure request object has auth property for MCP SDK compatibility
          // const enhancedRequest = Object.assign(ctx.request, { auth: undefined });
          
          // Handle the request with the transport
          await transport.handleRequest(ctx, ctx.res, ctx.body);
        } catch (error) {
          this.logger.error('Error handling StreamHTTP request:', error);
          if (!ctx.response.headersSent) {
            ctx.status = 500;
            ctx.body = {
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: 'Internal server error'
              },
              id: null
            };
          }
        }
      };
      
      // Add routes for POST, GET, and DELETE methods
      routerService.addRouter(streamHttpHandler, {
        prefix: '/',
        requestMethod: 'POST',
        url: '/mcp',
      });
      
      routerService.addRouter(streamHttpHandler, {
        prefix: '/',
        requestMethod: 'GET',
        url: '/mcp',
      });
      
      routerService.addRouter(streamHttpHandler, {
        prefix: '/',
        requestMethod: 'DELETE',
        url: '/mcp',
      });

      // Backward compatibility: Add legacy SSE endpoints for older clients
      // Store SSE transports separately for legacy endpoint management
      const sseTransports: { [sessionId: string]: SSEServerTransport } = {};

      // Legacy SSE endpoint for older clients
      routerService.addRouter(
        async ctx => {
          const transport = new SSEServerTransport('/messages', ctx.res);
          sseTransports[transport.sessionId] = transport;
          ctx.res.on('close', () => {
            delete sseTransports[transport.sessionId];
          });
          await this.server.connect(transport);
        },
        {
          prefix: '/',
          requestMethod: 'GET',
          url: '/sse',
        }
      );

      // Legacy message endpoint for older clients
      routerService.addRouter(
        async ctx => {
          const sessionId = ctx.query.sessionId as string;
          const transport = sseTransports[sessionId];
          if (transport) {
            await transport.handlePostMessage(ctx, ctx.res, ctx.body);
          } else {
            ctx.status = 400;
            ctx.body = 'No transport found for sessionId';
          }
        },
        {
          prefix: '/',
          requestMethod: 'POST',
          url: '/messages',
        }
      );
    }
  }

  public async run(): Promise<void> {
    this.loadTools();
    if (this.applicationContext.hasObject(HTTP_SERVER_KEY)) {
      this.logger.info(
        '[midway:mcp] MCP server start success and attach to web server'
      );
    }
  }

  public loadTools() {
    const tools = DecoratorManager.listModule(MCP_TOOL_KEY);
    for (const tool of tools) {
      const toolMeta = MetadataManager.getMetadata(MCP_TOOL_KEY, tool);

      this.server.registerTool(
        toolMeta.toolName,
        toolMeta.toolSchema,
        async (...args) => {
          const ctx = this.app.createAnonymousContext();
          const fn = await this.applyMiddleware(async ctx => {
            const instance = (await ctx.requestContext.getAsync(
              tool
            )) as IMcpTool;
            // eslint-disable-next-line prefer-spread
            return await instance['execute'].call(instance, ...args);
          });
          return await fn(ctx);
        }
      );
    }
  }

  protected async beforeStop(): Promise<void> {}

  public getFrameworkName() {
    return 'mcp';
  }
}
