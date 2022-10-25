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
          this[COOKIES] = new Cookies(this, this.app.keys, cookieOptions);
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

    // https config
    if (this.configurationOptions.key && this.configurationOptions.cert) {
      this.configurationOptions.key = PathFileUtil.getFileContentSync(
        this.configurationOptions.key
      );
      this.configurationOptions.cert = PathFileUtil.getFileContentSync(
        this.configurationOptions.cert
      );
      this.configurationOptions.ca = PathFileUtil.getFileContentSync(
        this.configurationOptions.ca
      );

      if (this.configurationOptions.http2) {
        this.server = require('http2').createSecureServer(
          this.configurationOptions,
          this.app.callback()
        );
      } else {
        this.server = require('https').createServer(
          this.configurationOptions,
          this.app.callback()
        );
      }
    } else {
      if (this.configurationOptions.http2) {
        this.server = require('http2').createServer(this.app.callback());
      } else {
        this.server = require('http').createServer(this.app.callback());
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
