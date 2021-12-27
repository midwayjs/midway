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
import {
  WebRouterCollector,
  RouterInfo,
  MidwayMiddlewareService,
  IMidwayApplication,
} from '../index';
import * as util from 'util';

const debug = util.debuglog('midway:debug');

export abstract class WebControllerGenerator<
  Router extends { use: (...args) => void }
> {
  protected constructor(readonly app: IMidwayApplication) {}

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
    const applicationContext = this.app.getApplicationContext();
    const logger = this.app.getCoreLogger();
    const middlewareService = applicationContext.get(MidwayMiddlewareService);

    for (const routerInfo of routerList) {
      // bind controller first
      applicationContext.bindClass(routerInfo.routerModule);

      logger.debug(
        `Load Controller "${routerInfo.controllerId}", prefix=${routerInfo.prefix}`
      );

      debug(
        `[core]: Load Controller "${routerInfo.controllerId}", prefix=${routerInfo.prefix}`
      );

      // new router
      const newRouter: Router = this.createRouter({
        prefix: routerInfo.prefix,
        ...routerInfo.routerOptions,
      });

      // add router middleware
      routerInfo.middleware = routerInfo.middleware ?? [];
      if (routerInfo.middleware.length) {
        const routerMiddlewareFn = await middlewareService.compose(
          routerInfo.middleware,
          this.app
        );
        newRouter.use(routerMiddlewareFn);
      }

      // add route
      const routes = routerTable.get(routerInfo.prefix);
      for (const routeInfo of routes) {
        // get middleware
        const methodMiddlewares = [];

        routeInfo.middleware = routeInfo.middleware ?? [];
        if (routeInfo.middleware.length) {
          const routeMiddlewareFn = await middlewareService.compose(
            routeInfo.middleware,
            this.app
          );
          methodMiddlewares.push(routeMiddlewareFn);
        }

        if (this.app.getFrameworkType() === MidwayFrameworkType.WEB_KOA) {
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

        logger.debug(
          `Load Router "${routeInfo.requestMethod.toUpperCase()} ${
            routeInfo.url
          }"`
        );

        debug(
          `[core]: Load Router "${routeInfo.requestMethod.toUpperCase()} ${
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
}
