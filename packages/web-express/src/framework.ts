import {
  BaseFramework,
  extractExpressLikeValue,
  getClassMetadata,
  getPropertyDataFromClass,
  getPropertyMetadata,
  getProviderId,
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
  IMidwayExpressApplication,
  IMidwayExpressConfigurationOptions,
  Middleware,
  MiddlewareParamArray,
  IWebMiddleware,
  IMidwayExpressContext,
} from './interface';
import type { IRouter, IRouterHandler, RequestHandler } from 'express';
import * as express from 'express';
import { readFileSync } from 'fs';
import { Server } from 'net';
import { MidwayExpressContextLogger } from './logger';

export class MidwayExpressFramework extends BaseFramework<
  IMidwayExpressApplication,
  IMidwayExpressConfigurationOptions
> {
  public app: IMidwayExpressApplication;
  private controllerIds: string[] = [];
  public prioritySortRouters: Array<{
    priority: number;
    router: IRouter;
    prefix: string;
  }> = [];
  private server: Server;

  public configure(
    options: IMidwayExpressConfigurationOptions
  ): MidwayExpressFramework {
    this.configurationOptions = options;
    return this;
  }

  async applicationInitialize(options: Partial<IMidwayBootstrapOptions>) {
    this.app = (express() as unknown) as IMidwayExpressApplication;
    this.defineApplicationProperties({
      generateController: (controllerMapping: string) => {
        return this.generateController(controllerMapping);
      },

      generateMiddleware: async (middlewareId: string) => {
        return this.generateMiddleware(middlewareId);
      },
    });
    this.app.use((req, res, next) => {
      const ctx = { req, res } as IMidwayExpressContext;
      ctx.logger = new MidwayExpressContextLogger(ctx, this.appLogger);
      ctx.startTime = Date.now();
      ctx.requestContext = new MidwayRequestContainer(
        ctx,
        this.getApplicationContext()
      );
      (req as any).requestContext = ctx.requestContext;
      ctx.requestContext.registerObject('req', req);
      ctx.requestContext.registerObject('res', res);
      ctx.requestContext.ready();
      next();
    });
  }

  protected async afterContainerReady(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {
    await this.loadMidwayController();
  }

  public async run(): Promise<void> {
    // https config
    if (this.configurationOptions.key && this.configurationOptions.cert) {
      this.configurationOptions.key =
        typeof this.configurationOptions.key === 'string'
          ? readFileSync(this.configurationOptions.key as string)
          : this.configurationOptions.key;

      this.configurationOptions.cert =
        typeof this.configurationOptions.cert === 'string'
          ? readFileSync(this.configurationOptions.cert as string)
          : this.configurationOptions.cert;

      this.configurationOptions.ca =
        this.configurationOptions.ca &&
        (typeof this.configurationOptions.ca === 'string'
          ? readFileSync(this.configurationOptions.ca)
          : this.configurationOptions.ca);

      this.server = require('https').createServer(
        this.configurationOptions,
        this.app
      );
    } else {
      this.server = require('http').createServer(this.app);
    }

    if (this.configurationOptions.port) {
      new Promise<void>(resolve => {
        this.server.listen(this.configurationOptions.port, () => {
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
        this.app.use(prioritySortRouter.router);
      });
    }
  }

  public async generateMiddleware(middlewareId: string) {
    const mwIns = await this.getApplicationContext().getAsync<IWebMiddleware>(
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

  public async beforeStop() {
    this.server.close();
  }

  public getServer() {
    return this.server;
  }

  public getFrameworkName() {
    return 'midway:express'
  }
}
