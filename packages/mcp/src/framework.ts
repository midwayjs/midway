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
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { MCP_TOOL_KEY } from './decorator';

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
  }

  public async run(): Promise<void> {
    const { serverInfo, serverOptions, transportType = 'stdio' } = this.configurationOptions;

    // Create an MCP server
    this.server = new McpServer(serverInfo, serverOptions);

    // Start receiving messages on stdin and sending messages on stdout
    if (transportType === 'stdio') {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
    } else if (transportType === 'sse') {
      if (this.applicationContext.hasObject(HTTP_SERVER_KEY)) {
        const routerService = this.applicationContext.get(MidwayWebRouterService);
        // to support multiple simultaneous connections we have a lookup object from
        // sessionId to transport
        const transports: {[sessionId: string]: SSEServerTransport} = {};

        routerService.addRouter(async (ctx) => {
          const transport = new SSEServerTransport('/messages', ctx.response);
          transports[transport.sessionId] = transport;
          ctx.response.on("close", () => {
            delete transports[transport.sessionId];
          });
          await this.server.connect(transport);
        }, {
          prefix: '/',
          requestMethod: 'GET',
          url: '/sse',
        });

        routerService.addRouter(async (ctx) => {
          const sessionId = ctx.request.query.sessionId as string;
          const transport = transports[sessionId];
          if (transport) {
            await transport.handlePostMessage(ctx.request, ctx.response);
          } else {
            ctx.response.status(400).send('No transport found for sessionId');
          }
        }, {
          prefix: '/',
          requestMethod: 'POST',
          url: '/messages',
        });

        this.logger.info(
          '[midway:mcp] MCP server start success and attach to web server'
        );
      }
    }
  }

  protected loadTools() {
    const tools = DecoratorManager.listModule(MCP_TOOL_KEY);
    for (const tool of tools) {
      const toolMeta = MetadataManager.getMetadata(MCP_TOOL_KEY, tool);

      this.server.tool(
        toolMeta.toolName,
        toolMeta.toolSchema,
        async (...args) => {
          const ctx = this.app.createAnonymousContext();
          const fn = await this.applyMiddleware(async ctx => {
            const instance = await ctx.requestContext.getAsync(tool) as IMcpTool;
            // eslint-disable-next-line prefer-spread
            return await instance['execute'].call(instance, ...args);
          });
          return await fn(ctx);
        }
      );
    }
  }

  protected async beforeStop(): Promise<void> {
  }

  public getFrameworkName() {
    return 'mcp';
  }
} 