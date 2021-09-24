import {
  BaseFramework,
  extractKoaLikeValue,
  HTTP_SERVER_KEY,
  IMidwayBootstrapOptions,
  IMidwayContext,
  MidwayFrameworkType,
  PathFileUtil,
  WebRouterCollector,
} from '@midwayjs/core';

import {
  RouterParamValue,
  WEB_RESPONSE_CONTENT_TYPE,
  WEB_RESPONSE_HEADER,
  WEB_RESPONSE_HTTP_CODE,
  WEB_RESPONSE_REDIRECT,
} from '@midwayjs/decorator';
import {
  IMidwayKoaApplication,
  IMidwayKoaApplicationPlus,
  IMidwayKoaConfigurationOptions,
  IMidwayKoaContext,
  IWebMiddleware,
  MiddlewareParamArray,
} from './interface';
import * as Router from '@koa/router';
import type { DefaultState, Middleware } from 'koa';
import * as koa from 'koa';
import { MidwayKoaContextLogger } from './logger';
import { Server } from 'net';

export abstract class MidwayKoaBaseFramework<
  APP extends IMidwayKoaApplicationPlus<CTX>,
  CTX extends IMidwayContext,
  OPT
> extends BaseFramework<APP, CTX, OPT> {
  public app: APP;
  private controllerIds: string[] = [];
  public prioritySortRouters: Array<{
    priority: number;
    router: Router;
  }> = [];

  public getApplication(): APP {
    return this.app;
  }

  /**
   * wrap controller string to middleware function
   * @param controllerMapping like FooController.index
   * @param routeArgsInfo
   * @param routerResponseData
   */
  public generateController(
    controllerMapping: string,
    routeArgsInfo?: RouterParamValue[],
    routerResponseData?: any[]
  ): Middleware<DefaultState, IMidwayKoaContext> {
    const [controllerId, methodName] = controllerMapping.split('.');
    return async (ctx, next) => {
      const args = [ctx, next];
      if (Array.isArray(routeArgsInfo)) {
        await Promise.all(
          routeArgsInfo.map(async ({ index, type, propertyData }) => {
            args[index] = await extractKoaLikeValue(type, propertyData)(
              ctx,
              next
            );
          })
        );
      }
      const controller = await ctx.requestContext.getAsync(controllerId);
      // eslint-disable-next-line prefer-spread
      const result = await controller[methodName].apply(controller, args);
      if (result !== undefined) {
        ctx.body = result;
      }

      if (ctx.body === undefined && !(ctx.response as any)._explicitStatus) {
        ctx.body = undefined;
      }

      // implement response decorator
      if (Array.isArray(routerResponseData) && routerResponseData.length) {
        for (const routerRes of routerResponseData) {
          switch (routerRes.type) {
            case WEB_RESPONSE_HTTP_CODE:
              ctx.status = routerRes.code;
              break;
            case WEB_RESPONSE_HEADER:
              for (const key in routerRes?.setHeaders || {}) {
                ctx.set(key, routerRes.setHeaders[key]);
              }
              break;
            case WEB_RESPONSE_CONTENT_TYPE:
              ctx.type = routerRes.contentType;
              break;
            case WEB_RESPONSE_REDIRECT:
              ctx.status = routerRes.code;
              ctx.redirect(routerRes.url);
              return;
          }
        }
      }
    };
  }

  public async generateMiddleware(middlewareId: string) {
    const mwIns = await this.getApplicationContext().getAsync<IWebMiddleware>(
      middlewareId
    );
    return mwIns.resolve();
  }

  public async loadMidwayController(): Promise<void> {
    const collector = new WebRouterCollector();
    const routerTable = await collector.getRouterTable();
    const routerList = await collector.getRoutePriorityList();

    for (const routerInfo of routerList) {
      // bind controller first
      this.getApplicationContext().bindClass(routerInfo.routerModule);

      const providerId = routerInfo.controllerId;
      // controller id check
      if (this.controllerIds.indexOf(providerId) > -1) {
        throw new Error(
          `Controller identifier [${providerId}] already exists!`
        );
      }
      this.controllerIds.push(providerId);
      this.logger.debug(
        `Load Controller "${providerId}", prefix=${routerInfo.prefix}`
      );

      // new router
      const newRouter = this.createRouter({
        prefix: routerInfo.prefix,
        ...routerInfo.routerOptions,
      });

      // add router middleware
      const middlewares = routerInfo.middleware as MiddlewareParamArray;
      await this.handlerWebMiddleware(
        middlewares,
        (middlewareImpl: Middleware) => {
          newRouter.use(middlewareImpl);
        }
      );

      // add route
      const routes = routerTable.get(routerInfo.prefix);
      for (const routeInfo of routes) {
        // get middleware
        const middlewares2 = routeInfo.middleware as MiddlewareParamArray;
        const methodMiddlewares: Middleware[] = [];

        await this.handlerWebMiddleware(
          middlewares2,
          (middlewareImpl: Middleware) => {
            methodMiddlewares.push(middlewareImpl);
          }
        );

        if (this.getFrameworkType() === MidwayFrameworkType.WEB_KOA) {
          if (typeof routeInfo.url === 'string' && /\*$/.test(routeInfo.url)) {
            routeInfo.url = routeInfo.url.replace('*', '(.*)');
          }
        }

        const routerArgs = [
          routeInfo.routerName,
          routeInfo.url,
          ...methodMiddlewares,
          this.generateController(
            routeInfo.handlerName,
            routeInfo.requestMetadata,
            routeInfo.responseMetadata
          ),
        ];

        this.logger.debug(
          `Load Router "${routeInfo.requestMethod.toUpperCase()} ${
            routeInfo.url
          }"`
        );

        // apply controller from request context
        // eslint-disable-next-line prefer-spread
        newRouter[routeInfo.requestMethod].apply(newRouter, routerArgs);
      }

      this.app.use(newRouter.middleware());
    }
  }

  protected createRouter(routerOptions): Router {
    const router = new Router(routerOptions);
    router.prefix(routerOptions.prefix);
    return router;
  }

  private async handlerWebMiddleware(
    middlewares: MiddlewareParamArray,
    handlerCallback: (middlewareImpl: Middleware) => void
  ): Promise<void> {
    if (middlewares && middlewares.length) {
      for (const middleware of middlewares) {
        if (typeof middleware === 'function') {
          // web function middleware
          handlerCallback(middleware);
        } else {
          const middlewareImpl: IWebMiddleware | void =
            await this.getApplicationContext().getAsync(middleware);
          if (middlewareImpl && typeof middlewareImpl.resolve === 'function') {
            handlerCallback(middlewareImpl.resolve());
          }
        }
      }
    }
  }

  public getDefaultContextLoggerClass() {
    return MidwayKoaContextLogger;
  }
}

export class MidwayKoaFramework extends MidwayKoaBaseFramework<
  IMidwayKoaApplication,
  IMidwayKoaContext,
  IMidwayKoaConfigurationOptions
> {
  private server: Server;

  async applicationInitialize(options: Partial<IMidwayBootstrapOptions>) {
    this.app = new koa<
      DefaultState,
      IMidwayKoaContext
    >() as IMidwayKoaApplication;
    this.app.use(async (ctx, next) => {
      this.app.createAnonymousContext(ctx);
      await next();
    });

    this.defineApplicationProperties({
      generateController: (controllerMapping: string) => {
        return this.generateController(controllerMapping);
      },

      generateMiddleware: async (middlewareId: string) => {
        return this.generateMiddleware(middlewareId);
      },
    });

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
  }

  protected async afterContainerReady(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {
    await this.loadMidwayController();
  }

  public async run(): Promise<void> {
    if (this.configurationOptions.port) {
      new Promise<void>(resolve => {
        const args: any[] = [this.configurationOptions.port];
        if (this.configurationOptions.hostname) {
          args.push(this.configurationOptions.hostname);
        }
        args.push(() => {
          resolve();
        });
        this.server.listen(...args);
      });
    }
  }

  public async beforeStop() {
    this.server.close();
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.WEB_KOA;
  }

  public getFrameworkName() {
    return 'midway:koa';
  }

  public getServer() {
    return this.server;
  }
}
