import {
  BaseFramework,
  extractKoaLikeValue,
  generateProvideId,
  getClassMetadata,
  getPropertyDataFromClass,
  getPropertyMetadata,
  getProviderId,
  IMidwayBootstrapOptions,
  listModule,
  MidwayProcessTypeEnum,
  PRIVATE_META_DATA_KEY,
} from "@midwayjs/core";

import {
  APPLICATION_KEY,
  CONFIG_KEY, CONTROLLER_KEY,
  LOGGER_KEY,
  PLUGIN_KEY, PRIORITY_KEY, WEB_RESPONSE_HEADER,
  WEB_RESPONSE_HTTP_CODE, WEB_RESPONSE_KEY, WEB_RESPONSE_REDIRECT, WEB_ROUTER_KEY, WEB_ROUTER_PARAM_KEY,
  RouterOption, RouterParamValue, ControllerOption
} from "@midwayjs/decorator";
import {
  IMidwayWebApplication,
  IMidwayWebConfigurationOptions,
  MiddlewareParamArray,
  WebMiddleware
} from "./interface";
import * as Router from 'koa-router';
import * as KOAApplication from 'koa';
import type { Middleware } from 'koa';

export class MidwayWebFramework extends BaseFramework<IMidwayWebConfigurationOptions> {
  private app: IMidwayWebApplication;
  private controllerIds: string[] = [];
  public prioritySortRouters: Array<{
    priority: number;
    router: Router;
  }> = [];

  public configure(
    options: IMidwayWebConfigurationOptions
  ): MidwayWebFramework {
    this.configurationOptions = options;
    return this;
  }

  protected async beforeInitialize(
    options: Partial<IMidwayBootstrapOptions>
  ) {
    options.ignore = options.ignore || [];
    options.ignore.push('**/app/extend/**');
  }

  protected async afterDirectoryLoad(options: Partial<IMidwayBootstrapOptions>) {
    this.app = new KOAApplication();

    this.defineApplicationProperties(this.app);
    // register plugin
    this.containerLoader.registerHook(
      PLUGIN_KEY,
      (key: string, target: any) => {
        return this.app[key];
      }
    );

    // register config
    this.containerLoader.registerHook(CONFIG_KEY, (key: string) => {
      return this.getConfiguration(key);
    });

    // register logger
    this.containerLoader.registerHook(LOGGER_KEY, (key: string) => {
      if (this.app.getLogger) {
        return this.app.getLogger(key);
      }
      return this.app.coreLogger;
    });
    // register app
    this.containerLoader.registerHook(APPLICATION_KEY, () => {
      return this.app;
    });
  }

  protected async afterInitialize(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {
    await this.loadMidwayController();
  }

  public async run(): Promise<void> {
    return this.app.listen(this.configurationOptions.port);
  }

  protected async beforeStop(): Promise<void> {
    await this.app.close();
  }

  public getApplication(): IMidwayWebApplication {
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
    routerResponseData?: any []
  ): Middleware {
    const [controllerId, methodName] = controllerMapping.split('.');
    return async (ctx, next) => {
      const args = [ctx, next];
      if (Array.isArray(routeArgsInfo)) {
        await Promise.all(
          routeArgsInfo.map(async ({ index, type, propertyData }) => {
            args[index] = await extractKoaLikeValue(type, propertyData)(ctx, next);
          })
        );
      }
      const controller = await ctx.requestContext.getAsync(controllerId);
      const result = await controller[methodName].apply(controller, args);
      if (result) {
        ctx.body = result;
      }

      // implement response decorator
      if (Array.isArray(routerResponseData) && routerResponseData.length) {
        for (const routerRes of routerResponseData) {
          switch (routerRes.type) {
            case WEB_RESPONSE_HTTP_CODE:
              ctx.status = routerRes.code;
              break;
            case WEB_RESPONSE_HEADER:
              routerRes.setHeaders.forEach((key, value) => {
                ctx.set(key, value);
              });
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
    const newRouter = this.createEggRouter(controllerOption);

    if (newRouter) {
      // implement middleware in controller
      const middlewares: MiddlewareParamArray | void =
        controllerOption.routerOptions.middleware;
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
          const middlewares2: MiddlewareParamArray | void =
            webRouter.middleware;
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
            getPropertyMetadata(
              WEB_RESPONSE_KEY,
              target,
              webRouter.method
            ) || [];

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
  private createEggRouter(controllerOption: ControllerOption): Router {
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
    middlewares: MiddlewareParamArray | void,
    handlerCallback: (middlewareImpl: Middleware) => void
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

  private defineApplicationProperties(app): IMidwayWebApplication {
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

      getMidwayType: () => {
        return 'MIDWAY_WEB';
      },

      getProcessType: () => {
        return MidwayProcessTypeEnum.APPLICATION;
      }
    });
  }
}
