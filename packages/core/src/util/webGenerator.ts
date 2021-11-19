/**
 * wrap controller string to middleware function
 * @param controllerMapping like FooController.index
 * @param routeArgsInfo
 * @param routerResponseData
 */
import {
  MidwayFrameworkType,
  WEB_RESPONSE_CONTENT_TYPE,
  WEB_RESPONSE_HEADER,
  WEB_RESPONSE_HTTP_CODE,
  WEB_RESPONSE_REDIRECT,
} from '@midwayjs/decorator';
import { WebRouterCollector, IMidwayContainer, RouterInfo } from '../';
import { ILogger } from '@midwayjs/logger';

export abstract class WebControllerGenerator<
  Router extends { use: (...args) => void }
> {
  private controllerIds: string[] = [];

  protected constructor(
    readonly applicationContext: IMidwayContainer,
    readonly frameworkType: MidwayFrameworkType,
    readonly logger?: ILogger
  ) {}

  /**
   * wrap controller string to middleware function
   * @param routeInfo
   */
  public generateKoaController(routeInfo: RouterInfo) {
    return async (ctx, next) => {
      const args = [ctx, next];
      const controller = await ctx.requestContext.getAsync(routeInfo.id);
      // eslint-disable-next-line prefer-spread
      const result = await controller[routeInfo.method].apply(controller, args);
      if (result !== undefined) {
        ctx.body = result;
      }

      if (ctx.body === undefined && !(ctx.response as any)._explicitStatus) {
        ctx.body = undefined;
      }

      // implement response decorator
      if (
        Array.isArray(routeInfo.responseMetadata) &&
        routeInfo.responseMetadata.length
      ) {
        for (const routerRes of routeInfo.responseMetadata) {
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

  public async loadMidwayController(
    globalPrefix: string,
    routerHandler?: (newRouter: Router) => void
  ): Promise<void> {
    const collector = new WebRouterCollector('', {
      globalPrefix,
    });
    const routerTable = await collector.getRouterTable();
    const routerList = await collector.getRoutePriorityList();

    for (const routerInfo of routerList) {
      // bind controller first
      this.applicationContext.bindClass(routerInfo.routerModule);

      const providerId = routerInfo.controllerId;
      // controller id check
      if (this.controllerIds.indexOf(providerId) > -1) {
        throw new Error(
          `Controller identifier [${providerId}] already exists!`
        );
      }
      this.controllerIds.push(providerId);
      this.logger?.debug(
        `Load Controller "${providerId}", prefix=${routerInfo.prefix}`
      );

      // new router
      const newRouter: Router = this.createRouter({
        prefix: routerInfo.prefix,
        ...routerInfo.routerOptions,
      });

      // add router middleware
      await this.handlerWebMiddleware(routerInfo.middleware, middlewareImpl => {
        newRouter.use(middlewareImpl);
      });

      // add route
      const routes = routerTable.get(routerInfo.prefix);
      for (const routeInfo of routes) {
        // get middleware
        const middlewares2 = routeInfo.middleware;
        const methodMiddlewares = [];

        await this.handlerWebMiddleware(middlewares2, middlewareImpl => {
          methodMiddlewares.push(middlewareImpl);
        });

        if (this.frameworkType === MidwayFrameworkType.WEB_KOA) {
          if (typeof routeInfo.url === 'string' && /\*$/.test(routeInfo.url)) {
            routeInfo.url = routeInfo.url.replace('*', '(.*)');
          }
        }

        const routerArgs = [
          routeInfo.routerName,
          routeInfo.url,
          ...methodMiddlewares,
          this.generateController(routeInfo),
        ];

        this.logger?.debug(
          `Load Router "${routeInfo.requestMethod.toUpperCase()} ${
            routeInfo.url
          }"`
        );

        // apply controller from request context
        // eslint-disable-next-line prefer-spread
        newRouter[routeInfo.requestMethod].apply(newRouter, routerArgs);
      }

      routerHandler && routerHandler(newRouter);
    }
  }

  abstract createRouter(routerOptions): Router;
  abstract generateController(routeInfo: RouterInfo);

  protected async handlerWebMiddleware(
    middlewares: any[],
    handlerCallback: (middlewareImpl) => void
  ): Promise<void> {
    if (middlewares && middlewares.length) {
      for (const middleware of middlewares) {
        if (typeof middleware === 'function') {
          // web function middleware
          handlerCallback(middleware);
        } else {
          const middlewareImpl: any = await this.applicationContext.getAsync(
            middleware
          );
          if (middlewareImpl && typeof middlewareImpl.resolve === 'function') {
            handlerCallback(middlewareImpl.resolve());
          }
        }
      }
    }
  }
}
