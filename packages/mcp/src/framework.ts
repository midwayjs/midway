import {
  Framework,
  BaseFramework,
  HTTP_SERVER_KEY,
  DecoratorManager,
  MetadataManager,
  IMidwayApplication,
  MidwayTraceService,
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
import { randomUUID } from 'crypto';
import { MCPAuthInfoMiddleware } from './middleware/auth.middleware';

@Framework()
export class MidwayMCPFramework extends BaseFramework<
  IMidwayMCPApplication,
  IMidwayMCPContext,
  IMidwayMCPConfigurationOptions
> {
  protected frameworkLoggerName = 'mcpLogger';
  protected server: McpServer;
  private toolRegistrations: Array<{
    name: string;
    config: any;
    cb: any;
  }> = [];
  private promptRegistrations: Array<{
    name: string;
    config: any;
    cb: any;
  }> = [];
  private resourceRegistrations: Array<{
    name: string;
    uriOrTemplate: any;
    config: any;
    cb: any;
  }> = [];
  private activeServers = new Set<McpServer>();

  private createServer(trackRegistrations = false): McpServer {
    const { serverInfo, serverOptions } = this.configurationOptions;
    const server = new McpServer(serverInfo, serverOptions);

    if (trackRegistrations) {
      this.patchRegistrationTracking(server);
    } else {
      this.replayRegistrations(server);
    }

    return server;
  }

  private patchRegistrationTracking(server: McpServer) {
    const registerTool = server.registerTool.bind(server);
    server.registerTool = ((name, config, cb) => {
      this.toolRegistrations.push({ name, config, cb });
      return registerTool(name, config, cb);
    }) as typeof server.registerTool;

    const registerPrompt = server.registerPrompt.bind(server);
    server.registerPrompt = ((name, config, cb) => {
      this.promptRegistrations.push({ name, config, cb });
      return registerPrompt(name, config, cb);
    }) as typeof server.registerPrompt;

    const registerResource = server.registerResource.bind(server);
    server.registerResource = ((name, uriOrTemplate, config, cb) => {
      this.resourceRegistrations.push({ name, uriOrTemplate, config, cb });
      return registerResource(name, uriOrTemplate, config, cb);
    }) as typeof server.registerResource;
  }

  private replayRegistrations(server: McpServer) {
    for (const registration of this.toolRegistrations) {
      server.registerTool(
        registration.name,
        registration.config,
        registration.cb
      );
    }
    for (const registration of this.promptRegistrations) {
      server.registerPrompt(
        registration.name,
        registration.config,
        registration.cb
      );
    }
    for (const registration of this.resourceRegistrations) {
      server.registerResource(
        registration.name,
        registration.uriOrTemplate,
        registration.config,
        registration.cb
      );
    }
  }

  private async createConnectedServer(transport: {
    connect(server: McpServer): Promise<void>;
  }): Promise<McpServer> {
    const server = this.createServer();
    this.activeServers.add(server);
    try {
      await transport.connect(server);
      return server;
    } catch (error) {
      this.activeServers.delete(server);
      await server.close();
      throw error;
    }
  }

  private async runWithMCPEntrySpan<T = unknown>(
    name: string,
    attributes: Record<string, string>,
    metaArgs: Record<string, unknown>,
    callback: () => Promise<T>
  ): Promise<T> {
    const traceService = this.applicationContext.get(MidwayTraceService);
    const traceMetaResolver = (this.configurationOptions as any)?.tracing?.meta;
    const traceEnabled =
      (this.configurationOptions as any)?.tracing?.enable !== false;
    const traceExtractor = (this.configurationOptions as any)?.tracing
      ?.extractor;
    const customMeta =
      (metaArgs?.custom as Record<string, unknown> | undefined) ?? {};
    const entryCarrier =
      typeof traceExtractor === 'function'
        ? traceExtractor({
            request: metaArgs?.request,
            response: metaArgs?.response,
            custom: {
              ...customMeta,
            },
          })
        : {};
    return await traceService.runWithEntrySpan(
      name,
      {
        enable: traceEnabled,
        carrier: entryCarrier,
        attributes: {
          'midway.protocol': 'mcp',
          ...attributes,
        },
        meta: traceMetaResolver,
        metaArgs: {
          carrier: entryCarrier,
          ...metaArgs,
        },
      },
      callback
    );
  }

  configure() {
    return this.configService.getConfiguration('mcp');
  }

  async applicationInitialize(options) {
    this.app = {} as any;
    const { transportType = 'stdio' } = this.configurationOptions;
    this.server = this.createServer(true);

    // Handle backward compatibility: convert 'sse' to 'stream-http'
    const actualTransportType =
      transportType === 'sse' ? 'stream-http' : transportType;

    // Start receiving messages on stdin and sending messages on stdout
    if (actualTransportType === 'stdio') {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
    }
  }

  public async initializeMCPTransport(webApp: IMidwayApplication) {
    const {
      endpoints = {},
      transportOptions = {},
      enableJwtAuthHelper = false,
    } = this.configurationOptions;

    // 如果启用了JWT认证助手，自动注册中间件
    if (enableJwtAuthHelper) {
      webApp.useMiddleware(MCPAuthInfoMiddleware);
    }
    const streamHttpPath = endpoints.streamHttp || '/mcp';
    const ssePath = endpoints.sse || '/sse';
    const messagesPath = endpoints.messages || '/messages';

    // Map to store transports by session ID
    const transports: { [sessionId: string]: StreamableHTTPServerTransport } =
      {};
    const sessionServers: { [sessionId: string]: McpServer } = {};
    // Store SSE transports separately for legacy endpoint management
    const sseTransports: { [sessionId: string]: SSEServerTransport } = {};
    const sseServers: { [sessionId: string]: McpServer } = {};

    const isExpress = webApp.getNamespace() === 'express';
    const mcpMiddleware = async (ctx: any, resOrNext?: any, next?: any) => {
      if (!isExpress) {
        next = resOrNext;
      }
      // Handle StreamHTTP endpoints (configurable path)
      if (
        ctx.path === streamHttpPath &&
        ['GET', 'POST', 'DELETE'].includes(ctx.method)
      ) {
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
            // New initialization request - use configured transport options
            const streamHttpOptions = transportOptions.streamHttp || {};
            const userOnSessionInitialized =
              streamHttpOptions.onsessioninitialized;
            const transportConfig = {
              sessionIdGenerator: () => randomUUID(),
              onsessioninitialized: (sessionId: string) => {
                transports[sessionId] = transport;
                sessionServers[sessionId] = server;
                userOnSessionInitialized?.(sessionId);
              },
              ...streamHttpOptions,
            };
            transport = new StreamableHTTPServerTransport(transportConfig);
            let server: McpServer;

            // Set up cleanup on close
            transport.onclose = () => {
              const sid = transport.sessionId;
              if (sid && transports[sid]) {
                delete transports[sid];
              }
              if (sid && sessionServers[sid]) {
                const currentServer = sessionServers[sid];
                delete sessionServers[sid];
                this.activeServers.delete(currentServer);
                void currentServer.close();
              }
            };

            // Streamable HTTP transport must not share a server instance across
            // sessions in SDK >= 1.26.0.
            server = await this.createConnectedServer({
              connect: currentServer => currentServer.connect(transport),
            });
          } else {
            // Invalid request
            ctx.res.statusCode = 400;
            ctx.res.end(
              JSON.stringify({
                jsonrpc: '2.0',
                error: {
                  code: -32000,
                  message: 'Bad Request: No valid session ID provided',
                },
                id: null,
              })
            );
            return;
          }
          // Handle the request with the transport
          if (isExpress) {
            // For Express: ctx 就是 req 对象
            await transport.handleRequest(ctx, ctx.res, ctx.body);
          } else {
            // koa/egg
            await transport.handleRequest(ctx.req, ctx.res, ctx.request.body);
          }
        } catch (error) {
          this.logger.error('Error handling StreamHTTP request:', error);
          const headersSent = isExpress
            ? ctx.res.headersSent
            : ctx.response?.headersSent ?? ctx.res.headersSent;
          if (!headersSent) {
            ctx.res.statusCode = 500;
            ctx.res.end(
              JSON.stringify({
                jsonrpc: '2.0',
                error: {
                  code: -32603,
                  message: 'Internal server error',
                },
                id: null,
              })
            );
          }
        }
      }
      // Handle legacy SSE endpoints for backward compatibility (configurable paths)
      else if (ctx.path === ssePath && ctx.method === 'GET') {
        ctx.respond = false; // we will handle the response ourselves
        // Handle SSE connection - use configured transport options
        const sseOptions = transportOptions.sse || {};
        const transport = new SSEServerTransport(
          messagesPath,
          ctx.res,
          sseOptions
        );
        sseTransports[transport.sessionId] = transport;
        const server = await this.createConnectedServer({
          connect: currentServer => currentServer.connect(transport),
        });
        sseServers[transport.sessionId] = server;
        ctx.res.on('close', () => {
          delete sseTransports[transport.sessionId];
          const currentServer = sseServers[transport.sessionId];
          delete sseServers[transport.sessionId];
          if (currentServer) {
            this.activeServers.delete(currentServer);
            void currentServer.close();
          }
        });
      } else if (ctx.path === messagesPath && ctx.method === 'POST') {
        ctx.respond = false; // we will handle the response ourselves
        const sessionId = ctx.query.sessionId as string;
        const transport = sseTransports[sessionId];
        if (transport) {
          if (isExpress) {
            await transport.handlePostMessage(ctx, ctx.res, ctx.body);
          } else {
            // koa/egg
            await transport.handlePostMessage(
              ctx.req,
              ctx.res,
              ctx.request.body
            );
          }
        } else {
          ctx.res.statusCode = 400;
          ctx.res.end('No transport found for sessionId');
        }
      } else {
        return await next();
      }
    };

    webApp.useMiddleware(mcpMiddleware);
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
        async (args: any, extra: any) => {
          if (extra === undefined) {
            extra = args;
            args = {};
          }
          const ctx = this.app.createAnonymousContext(
            extra
          ) as IMidwayMCPContext;

          return await this.runWithMCPEntrySpan(
            `mcp.tool ${toolMeta.toolName}`,
            {
              'midway.mcp.kind': 'tool',
              'midway.mcp.name': toolMeta.toolName,
            },
            {
              ctx,
              request: args,
              custom: {
                kind: 'tool',
                name: toolMeta.toolName,
              },
            },
            async () => {
              const fn = await this.applyMiddleware(
                async (ctx: IMidwayMCPContext) => {
                  const instance = (await ctx.requestContext.getAsync(
                    tool
                  )) as IMcpTool;
                  return await instance['execute'].call(instance, args);
                }
              );
              return await fn(ctx);
            }
          );
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
        async (args, extra) => {
          const ctx = this.app.createAnonymousContext() as IMidwayMCPContext;

          // 从 MCP SDK 的 MessageExtraInfo 中获取 authInfo
          if (extra?.authInfo) {
            ctx.authInfo = extra.authInfo;
          }

          return await this.runWithMCPEntrySpan(
            `mcp.prompt ${promptMeta.promptName}`,
            {
              'midway.mcp.kind': 'prompt',
              'midway.mcp.name': promptMeta.promptName,
            },
            {
              ctx,
              request: args,
              custom: {
                kind: 'prompt',
                name: promptMeta.promptName,
              },
            },
            async () => {
              const fn = await this.applyMiddleware(
                async (ctx: IMidwayMCPContext) => {
                  const instance = (await ctx.requestContext.getAsync(
                    prompt
                  )) as IMcpPrompt;
                  return await instance['generate'].call(instance, args);
                }
              );
              return await fn(ctx);
            }
          );
        }
      );
    }
  }

  public loadResources() {
    const resources = DecoratorManager.listModule(MCP_RESOURCE_KEY);
    for (const resource of resources) {
      const resourceMeta = MetadataManager.getMetadata(
        MCP_RESOURCE_KEY,
        resource
      );

      this.server.registerResource(
        resourceMeta.resourceName,
        resourceMeta.resourceConfig.uri || resourceMeta.resourceConfig,
        resourceMeta.resourceConfig,
        async (uri, extra) => {
          const ctx = this.app.createAnonymousContext() as IMidwayMCPContext;

          // 从 MCP SDK 的 MessageExtraInfo 中获取 authInfo
          if (extra?.authInfo) {
            ctx.authInfo = extra.authInfo;
          }

          return await this.runWithMCPEntrySpan(
            `mcp.resource ${resourceMeta.resourceName}`,
            {
              'midway.mcp.kind': 'resource',
              'midway.mcp.name': resourceMeta.resourceName,
            },
            {
              ctx,
              request: uri,
              custom: {
                kind: 'resource',
                name: resourceMeta.resourceName,
              },
            },
            async () => {
              const fn = await this.applyMiddleware(
                async (ctx: IMidwayMCPContext) => {
                  const instance = (await ctx.requestContext.getAsync(
                    resource
                  )) as IMcpResource;
                  return await instance['handle'].call(instance, uri);
                }
              );
              return await fn(ctx);
            }
          );
        }
      );
    }
  }

  public getServer(): McpServer {
    return this.server;
  }

  protected async beforeStop(): Promise<void> {
    await Promise.all(
      Array.from(this.activeServers).map(async server => {
        this.activeServers.delete(server);
        await server.close();
      })
    );
    await this.server.close();
  }

  public getFrameworkName() {
    return 'mcp';
  }
}
