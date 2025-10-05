import {
  Framework,
  BaseFramework,
  HTTP_SERVER_KEY,
  DecoratorManager,
  MetadataManager,
  IMidwayApplication
} from '@midwayjs/core';
import {
  IMidwayMCPApplication,
  IMidwayMCPConfigurationOptions,
  IMidwayMCPContext,
  IMcpTool,
  IMcpPrompt,
  IMcpResource,
} from './interface';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { MCP_TOOL_KEY, MCP_PROMPT_KEY, MCP_RESOURCE_KEY } from './decorator';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

@Framework()
export class MidwayMCPFramework extends BaseFramework<
  IMidwayMCPApplication,
  IMidwayMCPContext,
  IMidwayMCPConfigurationOptions
> {
  public app: IMidwayMCPApplication;
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

    // Handle backward compatibility: convert 'sse' to 'stream-http'
    const actualTransportType = transportType === 'sse' ? 'stream-http' : transportType;

    // Start receiving messages on stdin and sending messages on stdout
    if (actualTransportType === 'stdio') {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
    }
  }

  public async initializeMCPTransport(webApp: IMidwayApplication) {
    const { endpoints = {} } = this.configurationOptions;
    const streamHttpPath = endpoints.streamHttp || '/mcp';
    const ssePath = endpoints.sse || '/sse';
    const messagesPath = endpoints.messages || '/messages';
    
    // Map to store transports by session ID
    const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};
    // Store SSE transports separately for legacy endpoint management
    const sseTransports: { [sessionId: string]: SSEServerTransport } = {};

    const isExpress = webApp.getNamespace() === 'express';
    webApp.useMiddleware(async (ctx: any, next) => {
      // Handle StreamHTTP endpoints (configurable path)
      if (ctx.path === streamHttpPath && ['GET', 'POST', 'DELETE'].includes(ctx.method)) {
        if (!isExpress) {
          ctx.respond = false; // we will handle the response ourselves
        }
        
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
            ctx.res.statusCode = 400;
            ctx.res.end(JSON.stringify({
              jsonrpc: '2.0',
              error: {
                code: -32000,
                message: 'Bad Request: No valid session ID provided'
              },
              id: null
            }));
            return;
          }
          
          // Handle the request with the transport
          if (isExpress) {
            await transport.handleRequest(ctx, ctx.res, ctx.body);
          } else {
            // koa/egg
            await transport.handleRequest(ctx.req, ctx.res, ctx.request.body);
          }
        } catch (error) {
          this.logger.error('Error handling StreamHTTP request:', error);
          if (!ctx.response.headersSent) {
            ctx.res.statusCode = 500;
            ctx.res.end(JSON.stringify({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: 'Internal server error'
              },
              id: null
            }));
          }
        }
      }
      // Handle legacy SSE endpoints for backward compatibility (configurable paths)
      else if (ctx.path === ssePath && ctx.method === 'GET') {
        ctx.respond = false; // we will handle the response ourselves
        // Handle SSE connection
        const transport = new SSEServerTransport(messagesPath, ctx.res);
        sseTransports[transport.sessionId] = transport;
        ctx.res.on('close', () => {
          delete sseTransports[transport.sessionId];
        });
        await this.server.connect(transport);
      } else if (ctx.path === messagesPath && ctx.method === 'POST') {
        ctx.respond = false; // we will handle the response ourselves
        const sessionId = ctx.query.sessionId as string;
        const transport = sseTransports[sessionId];
        if (transport) {
          if (isExpress) {
            await transport.handlePostMessage(ctx, ctx.res, ctx.body);
          } else {
            // koa/egg
            await transport.handlePostMessage(ctx.req, ctx.res, ctx.request.body);
          }
        } else {
          ctx.res.statusCode = 400;
          ctx.res.end('No transport found for sessionId');
        }
      } else {
        return await next();
      }
    });
  }

  public async run(): Promise<void> {
    this.loadTools();
    this.loadPrompts();
    this.loadResources();
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

  public loadPrompts() {
    const prompts = DecoratorManager.listModule(MCP_PROMPT_KEY);
    for (const prompt of prompts) {
      const promptMeta = MetadataManager.getMetadata(MCP_PROMPT_KEY, prompt);

      this.server.registerPrompt(
        promptMeta.promptName,
        promptMeta.promptConfig,
        async (...args) => {
          const ctx = this.app.createAnonymousContext();
          const fn = await this.applyMiddleware(async ctx => {
            const instance = (await ctx.requestContext.getAsync(
              prompt
            )) as IMcpPrompt;
            // eslint-disable-next-line prefer-spread
            return await instance['generate'].call(instance, ...args);
          });
          return await fn(ctx);
        }
      );
    }
  }

  public loadResources() {
    const resources = DecoratorManager.listModule(MCP_RESOURCE_KEY);
    for (const resource of resources) {
      const resourceMeta = MetadataManager.getMetadata(MCP_RESOURCE_KEY, resource);

      this.server.registerResource(
        resourceMeta.resourceName,
        resourceMeta.resourceConfig.uri || resourceMeta.resourceConfig,
        resourceMeta.resourceConfig,
        async (...args) => {
          const ctx = this.app.createAnonymousContext();
          const fn = await this.applyMiddleware(async ctx => {
            const instance = (await ctx.requestContext.getAsync(
              resource
            )) as IMcpResource;
            // eslint-disable-next-line prefer-spread
            return await instance['handle'].call(instance, ...args);
          });
          return await fn(ctx);
        }
      );
    }
  }

  public getServer(): McpServer {
    return this.server;
  }

  protected async beforeStop(): Promise<void> {
    await this.server.close();
  }

  public getFrameworkName() {
    return 'mcp';
  }
}
