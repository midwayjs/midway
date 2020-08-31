import {
  IMidwayApplication,
  PRIVATE_META_DATA_KEY,
  util,
  BaseFramework,
  IMidwayBootstrapOptions,
  MidwayProcessTypeEnum,
} from '@midwayjs/core';

import {
  CONTROLLER_KEY,
  ControllerOption,
  PRIORITY_KEY,
  RouterOption,
  RouterParamValue,
  WEB_ROUTER_KEY,
  WEB_ROUTER_PARAM_KEY,
  getClassMetadata,
  getPropertyDataFromClass,
  getPropertyMetadata,
  getProviderId,
  listModule,
  PLUGIN_KEY,
  LOGGER_KEY,
  APPLICATION_KEY,
  WEB_RESPONSE_KEY, WEB_RESPONSE_HTTP_CODE, WEB_RESPONSE_HEADER, WEB_RESPONSE_REDIRECT, CONFIG_KEY,
} from '@midwayjs/decorator';

import { EggRouter } from '@eggjs/router';

import {
  IMidwayWebConfigurationOptions,
  Middleware,
  MiddlewareParamArray,
  WebMiddleware,
} from './interface';

import { resolve } from 'path';

import { Application, Router } from 'egg';

export type IMidwayWebApplication = IMidwayApplication & Application;

export class MidwayWebFramework extends BaseFramework<
  IMidwayWebConfigurationOptions
> {
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

  protected async afterInitialize(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {
    process.env.EGG_TYPESCRIPT = 'true';
    const { start } = require('egg');
    this.app = await start({
      baseDir: options.appDir,
      sourceDir: options.baseDir,
      ignoreWarning: true,
      framework: resolve(__dirname, 'application'),
      allConfig: this.getConfiguration(),
      mode: 'single',
    });

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
      return key ? this.app.config['key'] : this.app.config;
    });

    // register logger
    this.containerLoader.registerHook(LOGGER_KEY, (key: string) => {
      if (this.app.getLogger) {
        return this.app.getLogger(key);
      }
      return options.logger;
    });
    // register app
    this.containerLoader.registerHook(APPLICATION_KEY, () => {
      return this.app;
    });

    await this.loadMidwayController();
  }

  public async run(): Promise<void> {
    // return this.app.listen(this.configurationOptions.port);
  }

  public async stop(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public getApplication(): IMidwayWebApplication {
    return this.app;
  }

  /**
   * wrap controller string to middleware function
   * @param controllerMapping like FooController.index
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
          routeArgsInfo.map(async ({index, extractValue}) => {
            args[index] = await extractValue(ctx, next);
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
              routerRes.setHeaders.forEach((key, value) =>  {
                ctx.set(key, value);
              });
              break;
            case WEB_RESPONSE_REDIRECT:
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
        providerId = util.generateProvideId(providerId, meta.namespace);
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
      const router = new EggRouter({ sensitive }, this.app);
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
      },

      getApplicationContext: () => {
        return this.getApplicationContext();
      },

      get applicationContext() {
        return this.getApplicationContext();
      },
    });
  }
}
