import {
  BaseFramework,
  CommonMiddleware,
  ContextMiddlewareManager,
  FunctionMiddleware,
  HTTP_SERVER_KEY,
  IMidwayBootstrapOptions,
  MiddlewareRespond,
  MidwayFrameworkType,
  PathFileUtil,
  WebRouterCollector,
  ExceptionFilterManager,
} from '@midwayjs/core';

import {
  Framework,
  Inject,
  RouterParamValue,
  WEB_RESPONSE_CONTENT_TYPE,
  WEB_RESPONSE_HEADER,
  WEB_RESPONSE_HTTP_CODE,
  WEB_RESPONSE_REDIRECT,
} from '@midwayjs/decorator';
import {
  IMidwayExpressApplication,
  IMidwayExpressConfigurationOptions,
  IMidwayExpressContext,
  IMidwayExpressMiddleware,
} from './interface';
import type {
  IRouter,
  IRouterHandler,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';
import * as express from 'express';
import { Server } from 'net';
import { MidwayExpressContextLogger } from './logger';
import { MidwayExpressMiddlewareService } from './middlewareService';

@Framework()
export class MidwayExpressFramework extends BaseFramework<
  IMidwayExpressApplication,
  IMidwayExpressContext,
  IMidwayExpressConfigurationOptions
> {
  public app: IMidwayExpressApplication;
  private controllerIds: string[] = [];
  private server: Server;

  protected middlewareManager = new ContextMiddlewareManager<
    IMidwayExpressContext,
    Response,
    NextFunction
  >();
  protected exceptionFilterManager = new ExceptionFilterManager<
    IMidwayExpressContext,
    Response,
    NextFunction
  >();

  @Inject()
  private expressMiddlewareService: MidwayExpressMiddlewareService;

  configure(): IMidwayExpressConfigurationOptions {
    return this.configService.getConfiguration('express');
  }

  async applicationInitialize(options: Partial<IMidwayBootstrapOptions>) {
    this.app = express() as unknown as IMidwayExpressApplication;
    this.defineApplicationProperties({
      generateController: (controllerMapping: string) => {
        return this.generateController(controllerMapping);
      },
      /**
       * @deprecated
       */
      generateMiddleware: async (middlewareId: string) => {
        return this.generateMiddleware(middlewareId);
      },
    });
    this.app.use((req, res, next) => {
      const ctx = req as IMidwayExpressContext;
      this.app.createAnonymousContext(ctx);
      (req as any).requestContext = ctx.requestContext;
      ctx.requestContext.registerObject('req', req);
      ctx.requestContext.registerObject('res', res);
      next();
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
          this.app
        );
      } else {
        this.server = require('https').createServer(
          this.configurationOptions,
          this.app
        );
      }
    } else {
      if (this.configurationOptions.http2) {
        this.server = require('http2').createServer(this.app);
      } else {
        this.server = require('http').createServer(this.app);
      }
    }
    // register httpServer to applicationContext
    this.applicationContext.registerObject(HTTP_SERVER_KEY, this.server);
  }

  public async run(): Promise<void> {
    // use global middleware
    const globalMiddleware = await this.getMiddleware();
    this.app.use(globalMiddleware as any);
    // load controller
    await this.loadMidwayController();
    // use global error handler
    this.app.use(async (err, req, res, next) => {
      if (err) {
        const { result, error } = await this.exceptionFilterManager.run(
          err,
          req,
          res,
          next
        );
        if (error) {
          next(error);
        } else {
          res.send(result);
        }
      }
    });

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

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.WEB_EXPRESS;
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
      const controller = await req.requestContext.getAsync(controllerId);
      const result = await controller[methodName].call(
        controller,
        req,
        res,
        next
      );

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
      const newRouter = this.createRouter(routerInfo.routerOptions);

      // add router middleware
      await this.handlerWebMiddleware(
        routerInfo.middleware,
        (middlewareImpl: RequestHandler) => {
          newRouter.use(middlewareImpl);
        }
      );

      // add route
      const routes = routerTable.get(routerInfo.prefix);
      for (const routeInfo of routes) {
        // router middleware
        await this.handlerWebMiddleware(
          routeInfo.middleware,
          (middlewareImpl: RequestHandler) => {
            newRouter.use(middlewareImpl);
          }
        );

        this.logger.debug(
          `Load Router "${routeInfo.requestMethod.toUpperCase()} ${
            routeInfo.url
          }"`
        );

        // apply controller from request context
        newRouter[routeInfo.requestMethod].call(
          newRouter,
          routeInfo.url,
          this.generateController(
            routeInfo.handlerName,
            routeInfo.requestMetadata,
            routeInfo.responseMetadata
          )
        );
      }

      this.app.use(routerInfo.prefix, newRouter);
    }
  }
  /**
   * @deprecated
   */
  public async generateMiddleware(middlewareId: string) {
    const mwIns =
      await this.getApplicationContext().getAsync<IMidwayExpressMiddleware>(
        middlewareId
      );
    return mwIns.resolve();
  }

  /**
   * @param routerOptions
   */
  protected createRouter(routerOptions: { sensitive }): IRouter {
    return express.Router({ caseSensitive: routerOptions.sensitive });
  }

  private async handlerWebMiddleware(
    middlewares: Array<
      CommonMiddleware<IMidwayExpressContext, Response, NextFunction> | string
    >,
    handlerCallback: (
      middlewareImpl: FunctionMiddleware<
        IMidwayExpressContext,
        Response,
        NextFunction
      >
    ) => void
  ): Promise<void> {
    const fn = await this.expressMiddlewareService.compose(middlewares);
    handlerCallback(fn);
  }

  public async getMiddleware(): Promise<
    MiddlewareRespond<IMidwayExpressContext, Response, NextFunction>
  > {
    if (!this.composeMiddleware) {
      this.composeMiddleware = await this.expressMiddlewareService.compose(
        this.middlewareManager
      );
      await this.exceptionFilterManager.init(this.applicationContext);
    }
    return this.composeMiddleware;
  }

  public async beforeStop() {
    this.server.close();
  }

  public getServer() {
    return this.server;
  }

  public getFrameworkName() {
    return 'midway:express';
  }

  public getDefaultContextLoggerClass() {
    return MidwayExpressContextLogger;
  }
}
