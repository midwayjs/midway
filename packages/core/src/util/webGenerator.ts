/**
 * wrap controller string to middleware function
 * @param controllerMapping like FooController.index
 * @param routeArgsInfo
 * @param routerResponseData
 */
import {
  MidwayFrameworkType,
  RouterParamValue,
  WEB_RESPONSE_CONTENT_TYPE,
  WEB_RESPONSE_HEADER,
  WEB_RESPONSE_HTTP_CODE,
  WEB_RESPONSE_REDIRECT,
} from '@midwayjs/decorator';
import {
  extractKoaLikeValue,
  extractExpressLikeValue,
  WebRouterCollector,
  IMidwayContainer,
} from '../../src';
import { ILogger } from '@midwayjs/logger';

export abstract class WebControllerGenerator<
  Router extends { use: (...args) => void }
> {
  private controllerIds: string[] = [];
  public prioritySortRouters: Array<{
    priority: number;
    router: Router;
  }> = [];

  logger: ILogger;
  appLogger: ILogger;

  protected constructor(
    readonly applicationContext: IMidwayContainer,
    readonly frameworkType: MidwayFrameworkType
  ) {}

  /**
   * wrap controller string to middleware function
   * @param controllerMapping like FooController.index
   * @param routeArgsInfo
   * @param routerResponseData
   */
  public generateExpressController(
    controllerMapping: string,
    routeArgsInfo?: RouterParamValue[],
    routerResponseData?: any[]
  ) {
    const [controllerId, methodName] = controllerMapping.split('.');
    return async (req, res, next) => {
      const args = [req, res, next];
      if (Array.isArray(routeArgsInfo)) {
        await Promise.all(
          routeArgsInfo.map(async ({ index, type, propertyData }) => {
            args[index] = await extractExpressLikeValue(type, propertyData)(
              req,
              res,
              next
            );
          })
        );
      }
      const controller = await req.requestContext.getAsync(controllerId);
      // eslint-disable-next-line prefer-spread
      const result = await controller[methodName].apply(controller, args);

      if (res.headersSent) {
        // return when response send
        return;
      }

      if (res.statusCode === 200 && (result === null || result === undefined)) {
        res.status(204);
      }
      // implement response decorator
      if (Array.isArray(routerResponseData) && routerResponseData.length) {
        for (const routerRes of routerResponseData) {
          switch (routerRes.type) {
            case WEB_RESPONSE_HTTP_CODE:
              res.status(routerRes.code);
              break;
            case WEB_RESPONSE_HEADER:
              res.set(routerRes.setHeaders);
              break;
            case WEB_RESPONSE_CONTENT_TYPE:
              res.type(routerRes.contentType);
              break;
            case WEB_RESPONSE_REDIRECT:
              res.redirect(routerRes.code, routerRes.url);
              return;
          }
        }
      }
      res.send(result);
    };
  }

  /**
   * wrap controller string to middleware function
   * @param controllerMapping like FooController.index
   * @param routeArgsInfo
   * @param routerResponseData
   */
  public generateKoaController(
    controllerMapping: string,
    routeArgsInfo?: RouterParamValue[],
    routerResponseData?: any[]
  ) {
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

  public async loadMidwayController(
    routerHandler?: (newRouter: Router) => void
  ): Promise<void> {
    const collector = new WebRouterCollector();
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
      this.logger.debug(
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

      routerHandler && routerHandler(newRouter);
    }
  }

  abstract createRouter(routerOptions): Router;
  abstract generateController(
    controllerMapping: string,
    routeArgsInfo?: RouterParamValue[],
    routerResponseData?: any[]
  );

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
