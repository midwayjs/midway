import {
  BaseFramework,
  extractKoaLikeValue,
  getClassMetadata,
  getPropertyDataFromClass,
  getPropertyMetadata,
  getProviderId,
  IMidwayApplication,
  IMidwayBootstrapOptions,
  listModule,
  MidwayFrameworkType,
  MidwayRequestContainer,
} from '@midwayjs/core';

import {
  CONTROLLER_KEY,
  ControllerOption,
  PRIORITY_KEY,
  RouterOption,
  RouterParamValue,
  WEB_RESPONSE_CONTENT_TYPE,
  WEB_RESPONSE_HEADER,
  WEB_RESPONSE_HTTP_CODE,
  WEB_RESPONSE_KEY,
  WEB_RESPONSE_REDIRECT,
  WEB_ROUTER_KEY,
  WEB_ROUTER_PARAM_KEY,
} from '@midwayjs/decorator';
import {
  IMidwayKoaApplication,
  IMidwayKoaApplicationPlus,
  IMidwayKoaConfigurationOptions,
  IWebMiddleware,
  IMidwayKoaContext,
  MiddlewareParamArray,
} from './interface';
import * as Router from 'koa-router';
import type { DefaultState, Middleware } from 'koa';
import * as koa from 'koa';

export abstract class MidwayKoaBaseFramework<
  T,
  U extends IMidwayApplication & IMidwayKoaApplicationPlus,
  CustomContext
> extends BaseFramework<U, T> {
  public app: U;
  private controllerIds: string[] = [];
  public prioritySortRouters: Array<{
    priority: number;
    router: Router;
  }> = [];

  public getApplication(): U {
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
    const controllerModules = listModule(CONTROLLER_KEY);

    // implement @controller
    for (const module of controllerModules) {
      const providerId = getProviderId(module);
      if (providerId) {
        if (this.controllerIds.indexOf(providerId) > -1) {
          throw new Error(`controller identifier [${providerId}] is exists!`);
        }
        this.controllerIds.push(providerId);
        await this.preRegisterRouter(module, providerId);
      }
    }

    // implement @priority
    if (this.prioritySortRouters.length) {
      this.prioritySortRouters = this.prioritySortRouters.sort(
        (routerA, routerB) => {
          return routerB.priority - routerA.priority;
        }
      );

      this.prioritySortRouters.forEach(prioritySortRouter => {
        this.app.use(prioritySortRouter.router.middleware());
      });
    }
  }

  protected async preRegisterRouter(
    target: any,
    controllerId: string
  ): Promise<void> {
    const controllerOption: ControllerOption = getClassMetadata(
      CONTROLLER_KEY,
      target
    );
    const newRouter = this.createRouter(controllerOption);

    if (newRouter) {
      // implement middleware in controller
      const middlewares = controllerOption.routerOptions
        .middleware as MiddlewareParamArray;
      await this.handlerWebMiddleware(
        middlewares,
        (middlewareImpl: Middleware) => {
          newRouter.use(middlewareImpl);
        }
      );

      // implement @get @post
      const webRouterInfo: RouterOption[] = getClassMetadata(
        WEB_ROUTER_KEY,
        target
      );

      if (
        webRouterInfo &&
        typeof webRouterInfo[Symbol.iterator] === 'function'
      ) {
        for (const webRouter of webRouterInfo) {
          // get middleware
          const middlewares2 = webRouter.middleware as MiddlewareParamArray;
          const methodMiddlewares: Middleware[] = [];

          await this.handlerWebMiddleware(
            middlewares2,
            (middlewareImpl: Middleware) => {
              methodMiddlewares.push(middlewareImpl);
            }
          );

          // implement @body @query @param @body
          const routeArgsInfo =
            getPropertyDataFromClass(
              WEB_ROUTER_PARAM_KEY,
              target,
              webRouter.method
            ) || [];

          const routerResponseData =
            getPropertyMetadata(WEB_RESPONSE_KEY, target, webRouter.method) ||
            [];

          const routerArgs = [
            webRouter.routerName,
            webRouter.path,
            ...methodMiddlewares,
            this.generateController(
              `${controllerId}.${webRouter.method}`,
              routeArgsInfo,
              routerResponseData
            ),
          ];

          // apply controller from request context
          // eslint-disable-next-line prefer-spread
          newRouter[webRouter.requestMethod].apply(newRouter, routerArgs);
        }
      }

      // sort for priority
      const priority = getClassMetadata(PRIORITY_KEY, target);
      this.prioritySortRouters.push({
        priority: priority || 0,
        router: newRouter,
      });
    }
  }

  /**
   * @param controllerOption
   */
  protected createRouter(controllerOption: ControllerOption): Router {
    const {
      prefix,
      routerOptions: { sensitive },
    } = controllerOption;
    if (prefix) {
      const router = new Router({ sensitive });
      router.prefix(prefix);
      return router;
    }
    return null;
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
          const middlewareImpl: IWebMiddleware | void = await this.getApplicationContext().getAsync(
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

export class MidwayKoaFramework extends MidwayKoaBaseFramework<
  IMidwayKoaConfigurationOptions,
  IMidwayKoaApplication,
  IMidwayKoaContext
> {
  public configure(
    options: IMidwayKoaConfigurationOptions
  ): MidwayKoaFramework {
    this.configurationOptions = options;
    return this;
  }

  async applicationInitialize(options: Partial<IMidwayBootstrapOptions>) {
    this.app = new koa<
      DefaultState,
      IMidwayKoaContext
    >() as IMidwayKoaApplication;
    this.app.use(async (ctx, next) => {
      ctx.requestContext = new MidwayRequestContainer(
        ctx,
        this.getApplicationContext()
      );
      await ctx.requestContext.ready();
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
  }

  protected async afterContainerReady(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {
    await this.loadMidwayController();
  }

  public async run(): Promise<void> {
    if (this.configurationOptions.port) {
      new Promise(resolve => {
        this.app.listen(this.configurationOptions.port, () => {
          resolve();
        });
      });
    }
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.WEB_KOA;
  }
}
