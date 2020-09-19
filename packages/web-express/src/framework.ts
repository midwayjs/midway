import {
  BaseFramework,
  extractExpressLikeValue,
  generateProvideId,
  getClassMetadata,
  getPropertyDataFromClass,
  getPropertyMetadata,
  getProviderId,
  IMidwayBootstrapOptions,
  listModule,
  MidwayFrameworkType,
  MidwayProcessTypeEnum,
  MidwayRequestContainer,
  PRIVATE_META_DATA_KEY,
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
  IMidwayExpressApplication,
  IMidwayExpressConfigurationOptions,
  Middleware,
  MiddlewareParamArray,
  WebMiddleware,
  IMidwayExpressRequest,
} from './interface';
import type { IRouter, IRouterHandler, RequestHandler } from 'express';
import * as express from 'express';

export class MidwayExpressFramework extends BaseFramework<
  IMidwayExpressConfigurationOptions
> {
  protected app: IMidwayExpressApplication;
  private controllerIds: string[] = [];
  public prioritySortRouters: Array<{
    priority: number;
    router: IRouter;
    prefix: string;
  }> = [];

  public configure(
    options: IMidwayExpressConfigurationOptions
  ): MidwayExpressFramework {
    this.configurationOptions = options;
    return this;
  }

  protected async afterDirectoryLoad(
    options: Partial<IMidwayBootstrapOptions>
  ) {
    this.app = (express() as unknown) as IMidwayExpressApplication;
    this.defineApplicationProperties(this.app);
    this.app.use((req: IMidwayExpressRequest, res, next) => {
      req.requestContext = new MidwayRequestContainer(
        req,
        this.getApplicationContext()
      );
      req.requestContext.registerObject('req', req);
      req.requestContext.registerObject('res', res);
      req.requestContext.ready();
      next();
    });
  }

  protected async afterInitialize(
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
    return MidwayFrameworkType.WEB_EXPRESS;
  }

  public getApplication(): IMidwayExpressApplication {
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
  ): IRouterHandler<any> {
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

      if (result) {
        res.send(result);
      }
    };
  }

  public async loadMidwayController(): Promise<void> {
    const controllerModules = listModule(CONTROLLER_KEY);

    // implement @controller
    for (const module of controllerModules) {
      let providerId = getProviderId(module);
      const meta = getClassMetadata(PRIVATE_META_DATA_KEY, module);
      if (providerId && meta) {
        providerId = generateProvideId(providerId, meta.namespace);
      }
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
        this.app.use(prioritySortRouter.router);
      });
    }
  }

  public async generateMiddleware(middlewareId: string) {
    const mwIns = await this.getApplicationContext().getAsync<WebMiddleware>(
      middlewareId
    );
    return mwIns.resolve();
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
      const middlewares = (controllerOption.routerOptions
        .middleware as unknown) as MiddlewareParamArray;
      await this.handlerWebMiddleware(
        middlewares,
        (middlewareImpl: RequestHandler) => {
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
          const middlewares2 = (webRouter.middleware as unknown) as MiddlewareParamArray;
          // const methodMiddlewares: MiddlewareParamArray = [];

          await this.handlerWebMiddleware(
            middlewares2,
            (middlewareImpl: Middleware) => {
              // methodMiddlewares.push(middlewareImpl);
              newRouter.use(middlewareImpl);
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

          // apply controller from request context
          newRouter[webRouter.requestMethod].call(
            newRouter,
            webRouter.path,
            this.generateController(
              `${controllerId}.${webRouter.method}`,
              routeArgsInfo,
              routerResponseData
            )
          );
        }
      }

      // sort for priority
      const priority = getClassMetadata(PRIORITY_KEY, target);
      this.prioritySortRouters.push({
        priority: priority || 0,
        router: newRouter,
        prefix: controllerOption.prefix,
      });
    }
  }

  /**
   * @param controllerOption
   */
  protected createRouter(controllerOption: ControllerOption): IRouter {
    const {
      prefix,
      routerOptions: { sensitive },
    } = controllerOption;
    if (prefix) {
      return express.Router({ caseSensitive: sensitive });
    }
    return null;
  }

  private async handlerWebMiddleware(
    middlewares: MiddlewareParamArray,
    handlerCallback: (middlewareImpl: RequestHandler) => void
  ): Promise<void> {
    if (middlewares && middlewares.length) {
      for (const middleware of middlewares) {
        if (typeof middleware === 'function') {
          // web function middleware
          handlerCallback(middleware);
        } else {
          const middlewareImpl: WebMiddleware | void = await this.getApplicationContext().getAsync(
            middleware
          );
          if (middlewareImpl && typeof middlewareImpl.resolve === 'function') {
            handlerCallback(middlewareImpl.resolve());
          }
        }
      }
    }
  }

  protected defineApplicationProperties(
    app: IMidwayExpressApplication
  ): IMidwayExpressApplication {
    return Object.assign(app, {
      getBaseDir: () => {
        return this.baseDir;
      },

      getAppDir: () => {
        return this.appDir;
      },

      getEnv: () => {
        return this.getApplicationContext()
          .getEnvironmentService()
          .getCurrentEnvironment();
      },

      getConfig: (key?: string) => {
        return this.getApplicationContext()
          .getConfigService()
          .getConfiguration(key);
      },

      getFrameworkType: () => {
        return this.getFrameworkType();
      },

      getProcessType: () => {
        return MidwayProcessTypeEnum.APPLICATION;
      },

      generateController: (controllerMapping: string) => {
        return this.generateController(controllerMapping);
      },

      generateMiddleware: async (middlewareId: string) => {
        return this.generateMiddleware(middlewareId);
      },
    });
  }
}
