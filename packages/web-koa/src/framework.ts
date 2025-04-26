import {
  BaseFramework,
  CommonFilterUnion,
  CommonMiddlewareUnion,
  HTTP_SERVER_KEY,
  IMidwayBootstrapOptions,
  MidwayFrameworkType,
  PathFileUtil,
  RouterInfo,
  WebControllerGenerator,
  MidwayConfigMissingError,
  httpError,
  MidwayWebRouterService,
  Framework,
  Types,
} from '@midwayjs/core';
import { Cookies } from '@midwayjs/cookies';
import {
  Context,
  IMidwayKoaApplication,
  IMidwayKoaConfigurationOptions,
  IMidwayKoaContext,
  IWebMiddleware,
} from './interface';
import * as Router from '@koa/router';
import type { DefaultState, Middleware, Next } from 'koa';
import * as koa from 'koa';
import { Server } from 'http';
import { setupOnError } from './onerror';
import * as qs from 'qs';
import * as querystring from 'querystring';

const COOKIES = Symbol('context#cookies');

class KoaControllerGenerator extends WebControllerGenerator<Router> {
  constructor(readonly app, readonly webRouterService: MidwayWebRouterService) {
    super(app, webRouterService);
  }

  createRouter(routerOptions: any): Router {
    const router = new Router(routerOptions);
    router.prefix(routerOptions.prefix);
    return router;
  }

  generateController(routeInfo: RouterInfo) {
    return this.generateKoaController(routeInfo);
  }
}

@Framework()
export class MidwayKoaFramework extends BaseFramework<
  IMidwayKoaApplication,
  IMidwayKoaContext,
  IMidwayKoaConfigurationOptions,
  Next
> {
  private server: Server;
  private generator: KoaControllerGenerator;
  private webRouterService: MidwayWebRouterService;

  configure(): IMidwayKoaConfigurationOptions {
    return this.configService.getConfiguration('koa');
  }

  async applicationInitialize(options: Partial<IMidwayBootstrapOptions>) {
    const appKeys =
      this.configService.getConfiguration('keys') ||
      this.configurationOptions['keys'];
    if (!appKeys) {
      throw new MidwayConfigMissingError('config.keys');
    }

    const cookieOptions = this.configService.getConfiguration('cookies');
    const cookieGetOptions = this.configService.getConfiguration('cookiesGet');

    this.app = new koa<DefaultState, IMidwayKoaContext>({
      keys: [].concat(appKeys),
      proxy: this.configurationOptions.proxy,
      proxyIpHeader: this.configurationOptions.proxyIpHeader,
      subdomainOffset: this.configurationOptions.subdomainOffset,
      maxIpsCount: this.configurationOptions.maxIpsCount,
    }) as IMidwayKoaApplication;

    Object.defineProperty(this.app.context, 'cookies', {
      get() {
        if (!this[COOKIES]) {
          this[COOKIES] = new Cookies(
            this,
            this.app.keys,
            cookieOptions,
            cookieGetOptions
          );
        }
        return this[COOKIES];
      },
      enumerable: true,
    });

    Object.defineProperty(this.app.context, 'locals', {
      get() {
        return this.state;
      },
      set(value) {
        this.state = value;
      },
    });

    Object.defineProperty(this.app.context, 'forward', {
      get() {
        return async function (this: Context, url: string) {
          const routerService = this.requestContext.get(MidwayWebRouterService);
          const matchedUrlRouteInfo = await routerService.getMatchedRouterInfo(
            url,
            this.method
          );

          if (matchedUrlRouteInfo) {
            if (matchedUrlRouteInfo.controllerClz) {
              // normal class controller router
              const controllerInstance = await this.requestContext.getAsync(
                matchedUrlRouteInfo.controllerClz
              );
              return controllerInstance[matchedUrlRouteInfo.method as string](
                this
              );
            } else if (typeof matchedUrlRouteInfo.method === 'function') {
              // dynamic router
              return matchedUrlRouteInfo.method(this);
            }
          } else {
            throw new httpError.NotFoundError(`Forward url ${url} Not Found`);
          }
        };
      },
    });

    const converter =
      this.configurationOptions.queryParseMode === 'strict'
        ? function (value) {
            return !Array.isArray(value) ? [value] : value;
          }
        : this.configurationOptions.queryParseMode === 'first'
        ? function (value) {
            return Array.isArray(value) ? value[0] : value;
          }
        : undefined;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    // fix query with array params
    Object.defineProperty(this.app.request, 'query', {
      get() {
        const str = this.querystring;
        const c = (this._querycache = this._querycache || {});

        // find cache
        if (c[str]) return c[str];

        if (self.configurationOptions.queryParseMode) {
          // use qs module to parse query
          c[str] = qs.parse(
            str,
            self.configurationOptions.queryParseOptions || {}
          );
        } else {
          // use querystring to parse query by default
          c[str] = querystring.parse(str);
        }

        if (converter) {
          for (const key in c[str]) {
            c[str][key] = converter(c[str][key]);
          }
        }

        return c[str];
      },
      set(value) {
        this._querycache = this._querycache || {};
        this._querycache[this.querystring] = value;
      },
    });

    const onerrorConfig = this.configService.getConfiguration('onerror');
    setupOnError(this.app, onerrorConfig, this.logger);

    // not found middleware
    const notFound = async (ctx, next) => {
      await next();
      if (!ctx._matchedRoute && ctx.body === undefined) {
        throw new httpError.NotFoundError(`${ctx.path} Not Found`);
      }
    };

    // root middleware
    const midwayRootMiddleware = async (ctx, next) => {
      this.app.createAnonymousContext(ctx);
      await (
        await this.applyMiddleware(notFound)
      )(ctx, next);

      if (
        ctx.body === undefined &&
        !ctx.response._explicitStatus &&
        ctx._matchedRoute
      ) {
        // 如果进了路由，重新赋值，防止 404
        ctx.body = undefined;
      }
    };
    this.app.use(midwayRootMiddleware);

    this.webRouterService = await this.applicationContext.getAsync(
      MidwayWebRouterService,
      [
        {
          globalPrefix: this.configurationOptions.globalPrefix,
        },
      ]
    );
    this.generator = new KoaControllerGenerator(
      this.app,
      this.webRouterService
    );

    this.defineApplicationProperties();

    // hack use method
    (this.app as any).originUse = this.app.use;
    this.app.use = this.app.useMiddleware as any;
  }

  async loadMidwayController() {
    await this.generator.loadMidwayController(newRouter => {
      const dispatchFn = newRouter.middleware();
      dispatchFn._name = `midwayController(${newRouter?.opts?.prefix || '/'})`;
      this.app.use(dispatchFn);
    });
  }

  /**
   * wrap controller string to middleware function
   */
  public generateController(
    routeInfo: RouterInfo
  ): Middleware<DefaultState, IMidwayKoaContext> {
    return this.generator.generateKoaController(routeInfo);
  }

  /**
   * @deprecated
   * @param middlewareId
   */
  public async generateMiddleware(middlewareId: any) {
    const mwIns = await this.getApplicationContext().getAsync<IWebMiddleware>(
      middlewareId
    );
    return mwIns.resolve();
  }

  public async run(): Promise<void> {
    // load controller
    await this.loadMidwayController();
    // restore use method
    this.app.use = (this.app as any).originUse;

    const serverOptions = {
      ...this.configurationOptions,
      ...this.configurationOptions.serverOptions,
    };

    // https config
    if (serverOptions.key && serverOptions.cert) {
      serverOptions.key = PathFileUtil.getFileContentSync(serverOptions.key);
      serverOptions.cert = PathFileUtil.getFileContentSync(serverOptions.cert);
      serverOptions.ca = PathFileUtil.getFileContentSync(serverOptions.ca);
      process.env.MIDWAY_HTTP_SSL = 'true';

      if (serverOptions.http2) {
        this.server = require('http2').createSecureServer(
          serverOptions,
          this.app.callback()
        );
      } else {
        this.server = require('https').createServer(
          serverOptions,
          this.app.callback()
        );
      }
    } else {
      if (serverOptions.http2) {
        this.server = require('http2').createServer(
          serverOptions,
          this.app.callback()
        );
      } else {
        this.server = require('http').createServer(
          serverOptions,
          this.app.callback()
        );
      }
    }
    // register httpServer to applicationContext
    this.applicationContext.registerObject(HTTP_SERVER_KEY, this.server);

    // server timeout
    if (Types.isNumber(this.configurationOptions.serverTimeout)) {
      this.server.setTimeout(this.configurationOptions.serverTimeout);
    }

    // set port and listen server
    const customPort =
      process.env.MIDWAY_HTTP_PORT ?? this.configurationOptions.port;
    if (customPort) {
      new Promise<void>(resolve => {
        const args: any[] = [customPort];
        if (this.configurationOptions.hostname) {
          args.push(this.configurationOptions.hostname);
        }
        args.push(() => {
          resolve();
        });
        this.server.listen(...args);
        process.env.MIDWAY_HTTP_PORT = String(customPort);
      });
    }
  }

  public async beforeStop() {
    if (this.server) {
      new Promise(resolve => {
        this.server.close(resolve);
      });
    }
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.WEB_KOA;
  }

  public getFrameworkName() {
    return 'web:koa';
  }

  public getServer() {
    return this.server;
  }

  public getPort() {
    return process.env.MIDWAY_HTTP_PORT;
  }

  public useMiddleware(
    Middleware: CommonMiddlewareUnion<IMidwayKoaContext, Next, unknown>
  ) {
    this.middlewareManager.insertLast(Middleware);
  }

  public useFilter(
    Filter: CommonFilterUnion<IMidwayKoaContext, Next, unknown>
  ) {
    this.filterManager.useFilter(Filter);
  }
}
