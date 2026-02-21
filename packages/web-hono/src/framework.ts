import {
  BaseFramework,
  Framework,
  HTTP_SERVER_KEY,
  IMidwayBootstrapOptions,
  MidwayWebRouterService,
  RouterInfo,
  WEB_RESPONSE_CONTENT_TYPE,
  WEB_RESPONSE_HEADER,
  WEB_RESPONSE_HTTP_CODE,
  WEB_RESPONSE_REDIRECT,
  httpError,
} from '@midwayjs/core';
import { Context as HonoContext, Hono } from 'hono';
import {
  createServer,
  IncomingMessage,
  Server,
  ServerResponse,
} from 'node:http';
import { IMidwayHonoConfigurationOptions } from './interface';

@Framework()
export class MidwayHonoFramework extends BaseFramework<
  any,
  any,
  IMidwayHonoConfigurationOptions,
  any
> {
  private server: Server;
  private webRouterService: MidwayWebRouterService;

  configure(): IMidwayHonoConfigurationOptions {
    return this.configService.getConfiguration('hono');
  }

  async applicationInitialize(options: Partial<IMidwayBootstrapOptions>) {
    this.app = new Hono() as any;

    (this.app as any).use('*', async (ctx, next) => {
      (this.app as any).createAnonymousContext(ctx as any);
      const bodyText = await ctx.req.text();
      try {
        (ctx as any).requestBody = bodyText ? JSON.parse(bodyText) : undefined;
      } catch {
        (ctx as any).requestBody = bodyText;
      }
      await next();
    });
  }

  async run(): Promise<void> {
    await this.loadMidwayController();

    (this.app as any).notFound(c => {
      throw new httpError.NotFoundError(`${c.req.path} Not Found`);
    });

    (this.app as any).onError(async (err, c) => {
      const req = this.createRequestAdapter(c);
      const res = this.createResponseAdapter(c);
      const { result, error } = await this.filterManager.runErrorFilter(
        err,
        req,
        res
      );
      const finalError = error ?? err;
      if (finalError) {
        const status = finalError.status ?? 500;
        return c.json({ message: finalError.message, status }, status);
      }
      return this.toResponse(c, result);
    });

    const port = Number(
      process.env.MIDWAY_HTTP_PORT || this.configurationOptions.port || 7001
    );
    const hostname = this.configurationOptions.hostname || '127.0.0.1';

    this.server = createServer(async (req, res) => {
      const request = await this.toFetchRequest(req);
      const response = await (this.app as any).fetch(request);
      await this.writeNodeResponse(res, response);
    });

    await new Promise<void>(resolve =>
      this.server.listen(port, hostname, () => resolve())
    );

    process.env.MIDWAY_HTTP_PORT = String(port);
    this.applicationContext.registerObject(HTTP_SERVER_KEY, this.server);
  }

  protected async loadMidwayController() {
    this.webRouterService = await this.applicationContext.getAsync(
      MidwayWebRouterService,
      [
        {
          globalPrefix: this.configurationOptions.globalPrefix,
        },
      ]
    );

    const routerTable = await this.webRouterService.getRouterTable();
    const routerList = await this.webRouterService.getRoutePriorityList();

    for (const routerInfo of routerList) {
      this.getApplicationContext().bindClass(routerInfo.routerModule);
      const routes = routerTable.get(routerInfo.prefix);
      for (const routeInfo of routes) {
        const method = routeInfo.requestMethod.toLowerCase();
        const fullPath = `${routerInfo.prefix}${routeInfo.url}`.replace(
          /\/+/g,
          '/'
        );
        (this.app as any)[method](fullPath, this.generateController(routeInfo));
      }
    }
  }

  protected generateController(routeInfo: RouterInfo): any {
    return async (ctx: HonoContext, next) => {
      const req = this.createRequestAdapter(ctx);
      const res = this.createResponseAdapter(ctx);

      let result;
      if (typeof routeInfo.method !== 'string') {
        result = await routeInfo.method(req, res, next);
      } else {
        const controller = await (ctx as any).requestContext.getAsync(routeInfo.id);
        result = await controller[routeInfo.method].call(controller, req, res, next);
      }

      if (
        Array.isArray(routeInfo.responseMetadata) &&
        routeInfo.responseMetadata.length
      ) {
        for (const routerRes of routeInfo.responseMetadata) {
          switch (routerRes.type) {
            case WEB_RESPONSE_HTTP_CODE:
              ctx.status(routerRes.code);
              break;
            case WEB_RESPONSE_HEADER:
              Object.entries(routerRes.setHeaders).forEach(([key, value]) =>
                ctx.header(key, value as string)
              );
              break;
            case WEB_RESPONSE_CONTENT_TYPE:
              ctx.header('content-type', routerRes.contentType);
              break;
            case WEB_RESPONSE_REDIRECT:
              return ctx.redirect(routerRes.url, routerRes.code);
          }
        }
      }

      const { result: returnValue, error } = await this.filterManager.runResultFilter(
        result,
        req,
        res,
        next
      );
      if (error) {
        throw error;
      }
      return this.toResponse(ctx, returnValue);
    };
  }

  private createRequestAdapter(ctx: HonoContext) {
    return {
      ...ctx,
      ctx,
      path: ctx.req.path,
      baseUrl: ctx.req.path,
      ip: ctx.req.header('x-forwarded-for') ?? '',
      body: (ctx as any).requestBody,
      params: ctx.req.param(),
      query: ctx.req.query(),
      headers: Object.fromEntries(ctx.req.raw.headers.entries()),
      get: (name: string) => ctx.req.header(name),
      requestContext: (ctx as any).requestContext,
      logger: (ctx as any).logger,
      session: (ctx as any).session,
      files: (ctx as any).files,
    };
  }

  private createResponseAdapter(ctx: HonoContext) {
    const responseAdapter = {
      status: (code: number) => {
        ctx.status(code as any);
        return responseAdapter;
      },
      set: (headers: Record<string, string>) => {
        for (const [key, value] of Object.entries(headers)) {
          ctx.header(key, value);
        }
        return responseAdapter;
      },
      type: (contentType: string) => {
        ctx.header('content-type', contentType);
        return responseAdapter;
      },
      redirect: (code: number, url: string) => {
        return ctx.redirect(url, code as any);
      },
    };
    return responseAdapter;
  }

  private toResponse(ctx: HonoContext, value: any) {
    if (value === undefined || value === null) {
      return ctx.body(null, 204);
    }
    if (value instanceof Response) {
      return value;
    }
    if (typeof value === 'object') {
      return ctx.json(value);
    }
    return ctx.text(String(value));
  }

  private async toFetchRequest(req: IncomingMessage): Promise<Request> {
    const chunks: Uint8Array[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;
    const protocol = process.env.MIDWAY_HTTP_SSL === 'true' ? 'https' : 'http';
    const url = `${protocol}://${req.headers.host}${req.url}`;
    return new Request(url, {
      method: req.method,
      headers: req.headers as any,
      body: body as any,
    });
  }

  private async writeNodeResponse(
    res: ServerResponse,
    response: Response
  ): Promise<void> {
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    const data = Buffer.from(await response.arrayBuffer());
    res.end(data);
  }

  async beforeStop() {
    if (this.server) {
      await new Promise<void>(resolve => this.server.close(() => resolve()));
      process.env.MIDWAY_HTTP_PORT = '';
    }
  }

  getServer() {
    return this.server;
  }

  getPort(): string {
    return process.env.MIDWAY_HTTP_PORT;
  }
}
