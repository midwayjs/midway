import {
  BaseFramework,
  HTTP_SERVER_KEY,
  IMidwayBootstrapOptions,
  MiddlewareRespond,
  MidwayFrameworkType,
  PathFileUtil,
  RouterInfo,
  httpError,
  CommonMiddlewareUnion,
  FunctionMiddleware,
  MidwayWebRouterService,
  Framework,
  WEB_RESPONSE_CONTENT_TYPE,
  WEB_RESPONSE_HEADER,
  WEB_RESPONSE_HTTP_CODE,
  WEB_RESPONSE_REDIRECT,
} from '@midwayjs/core';
import {
  IMidwayExpressApplication,
  IMidwayExpressConfigurationOptions,
  Context,
} from './interface';
import type { IRouter, IRouterHandler, Response, NextFunction } from 'express';
import * as express from 'express';
import { Server } from 'net';
import {
  wrapAsyncHandler,
  MidwayExpressMiddlewareService,
} from './middlewareService';
import { debuglog } from 'util';
import { sendData } from './util';
const debug = debuglog('midway:debug');

@Framework()
export class MidwayExpressFramework extends BaseFramework<
  IMidwayExpressApplication,
  Context,
  IMidwayExpressConfigurationOptions,
  Response,
  NextFunction
> {
  public app: IMidwayExpressApplication;
  private server: Server;
  private expressMiddlewareService: MidwayExpressMiddlewareService;
  private webRouterService: MidwayWebRouterService;

  configure(): IMidwayExpressConfigurationOptions {
    return this.configService.getConfiguration('express');
  }

  async applicationInitialize(options: Partial<IMidwayBootstrapOptions>) {
    this.expressMiddlewareService = await this.applicationContext.getAsync(
      MidwayExpressMiddlewareService,
      [this.applicationContext]
    );
    debug('[express]: create express app');
    this.app = express() as unknown as IMidwayExpressApplication;
    debug('[express]: use root middleware');
    // use root middleware
    this.app.use((req, res, next) => {
      const ctx = req as Context;
      this.app.createAnonymousContext(ctx);
      (req as any).requestContext = ctx.requestContext;
      ctx.requestContext.registerObject('req', req);
      ctx.requestContext.registerObject('res', res);
      next();
    });

    this.defineApplicationProperties({
      useMiddleware: (
        routerPath:
          | string
          | CommonMiddlewareUnion<Context, Response, NextFunction>,
        ...middleware: FunctionMiddleware<Context, Response, NextFunction>[]
      ) => {
        if (typeof routerPath === 'string' && middleware) {
          return this.useRouterMiddleware(routerPath, middleware);
        } else {
          return this.useMiddleware(routerPath as any);
        }
      },
    });

    // hack use method
    (this.app as any).originUse = this.app.use;
    this.app.use = this.app.useMiddleware as any;
  }

  public async run(): Promise<void> {
    debug(`[express]: use middlewares = "${this.getMiddleware().getNames()}"`);
    // restore use method
    this.app.use = (this.app as any).originUse;

    debug('[express]: use user router middleware');
    // load controller，must apply router filter here
    const routerMiddlewares = await this.loadMidwayController();

    if (this.mockService.getContextMocksSize() > 0) {
      const mockMiddleware = (req, res, next) => {
        this.mockService.applyContextMocks(this.app, req);
        next();
      };
      this.app.use(mockMiddleware);
      debug('[express]: use and apply mock framework');
    }
    // use global middleware
    const globalMiddleware = await this.applyMiddleware();
    debug('[express]: use and apply all framework and global middleware');
    this.app.use(globalMiddleware as any);

    // load router after global middleware
    for (const info of routerMiddlewares) {
      this.app.use(info.prefix, info.middleware);
    }

    debug('[express]: use 404 not found middleware');
    // eslint-disable-next-line
    this.app.use(function notFound(req, res, next) {
      next(new httpError.NotFoundError(`${req.path} Not Found`));
    });

    debug('[express]: use global error handler middleware');
    // use global error handler
    this.app.use((err, req, res, next) => {
      this.filterManager
        .runErrorFilter(err, req, res, next)
        .then(data => {
          const { result, error } = data;
          if (error) {
            const status = error.status ?? res.statusCode ?? 500;
            // 5xx
            if (status >= 500) {
              try {
                req.logger.error(err);
              } catch (ex) {
                this.logger.error(err);
                this.logger.error(ex);
              }
              return;
            }

            // 4xx
            try {
              req.logger.warn(err);
            } catch (ex) {
              this.logger.warn(err);
              this.logger.error(ex);
            }

            res.status(status);
            next(error);
          } else {
            sendData(res, result);
          }
        })
        .catch(err => {
          next(err);
        });
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

    const customPort =
      process.env.MIDWAY_HTTP_PORT ?? this.configurationOptions.port;
    if (customPort) {
      new Promise<void>(resolve => {
        const args: any[] = [customPort];
        if (this.configurationOptions.hostname) {
          args.push(this.configurationOptions.hostname);
        }
        args.push(() => {
          resolve();
        });

        this.server.listen(...args);
        process.env.MIDWAY_HTTP_PORT = String(customPort);
      });
    }
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.WEB_EXPRESS;
  }

  /**
   * wrap controller string to middleware function
   */
  protected generateController(routeInfo: RouterInfo): IRouterHandler<any> {
    return wrapAsyncHandler(async (req, res, next) => {
      if (routeInfo.controllerClz && typeof routeInfo.method === 'string') {
        const isPassed = await this.app
          .getFramework()
          .runGuard(req, routeInfo.controllerClz, routeInfo.method);
        if (!isPassed) {
          throw new httpError.ForbiddenError();
        }
      }
      let result;
      if (typeof routeInfo.method !== 'string') {
        result = await routeInfo.method(req, res, next);
      } else {
        const controller = await req.requestContext.getAsync(routeInfo.id);
        result = await controller[routeInfo.method].call(
          controller,
          req,
          res,
          next
        );
      }

      if (res.headersSent) {
        // return when response send
        return;
      }

      if (res.statusCode === 200 && (result === null || result === undefined)) {
        res.status(204);
      }
      // implement response decorator
      if (
        Array.isArray(routeInfo.responseMetadata) &&
        routeInfo.responseMetadata.length
      ) {
        for (const routerRes of routeInfo.responseMetadata) {
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

      const { result: returnValue, error } =
        await this.filterManager.runResultFilter(result, req, res, next);

      if (error) {
        throw error;
      }

      sendData(res, returnValue);
    });
  }

  public async loadMidwayController(): Promise<
    Array<{
      prefix: string;
      middleware: any;
    }>
  > {
    this.webRouterService = await this.applicationContext.getAsync(
      MidwayWebRouterService,
      [
        {
          globalPrefix: this.configurationOptions.globalPrefix,
        },
      ]
    );
    const routerTable = await this.webRouterService.getRouterTable();
    const routerList = await this.webRouterService.getRoutePriorityList();
    const routerMiddlewares = [];

    for (const routerInfo of routerList) {
      // bind controller first
      this.getApplicationContext().bindClass(routerInfo.routerModule);

      this.logger.debug(
        `Load Controller "${routerInfo.controllerId}", prefix=${routerInfo.prefix}`
      );

      // new router
      const newRouter = this.createRouter(routerInfo.routerOptions);

      routerInfo.middleware = routerInfo.middleware ?? [];
      // add router middleware
      if (routerInfo.middleware.length) {
        const routerMiddlewareFn = await this.expressMiddlewareService.compose(
          routerInfo.middleware,
          this.app
        );
        newRouter.use(routerMiddlewareFn);
      }

      // add route
      const routes = routerTable.get(routerInfo.prefix);
      for (const routeInfo of routes) {
        const routeMiddlewareList = [];
        // routeInfo middleware
        routeInfo.middleware = routeInfo.middleware ?? [];
        if (routeInfo.middleware.length) {
          const routeMiddlewareFn = await this.expressMiddlewareService.compose(
            routeInfo.middleware,
            this.app
          );
          routeMiddlewareList.push(routeMiddlewareFn);
        }

        this.logger.debug(
          `Load Router "${routeInfo.requestMethod.toUpperCase()} ${
            routeInfo.url
          }"`
        );

        // apply controller from request context
        newRouter[routeInfo.requestMethod].call(
          newRouter,
          routeInfo.url,
          ...routeMiddlewareList,
          this.generateController(routeInfo)
        );
      }

      routerMiddlewares.push({
        prefix: routerInfo.prefix,
        middleware: newRouter,
      });
    }
    return routerMiddlewares;
  }

  /**
   * @param routerOptions
   */
  protected createRouter(routerOptions: { sensitive }): IRouter {
    return express.Router({ caseSensitive: routerOptions.sensitive });
  }

  public useRouterMiddleware(routerPath: string, middleware) {
    (this.app as any).originUse(routerPath, ...middleware);
  }

  public async applyMiddleware<Response, NextFunction>(): Promise<
    MiddlewareRespond<Context, Response, NextFunction>
  > {
    if (!this.composeMiddleware) {
      this.composeMiddleware = await this.expressMiddlewareService.compose(
        this.middlewareManager,
        this.app
      );
      await this.filterManager.init(this.applicationContext);
    }
    return this.composeMiddleware;
  }

  public async beforeStop() {
    if (this.server) {
      new Promise(resolve => {
        this.server.close(resolve);
      });
    }
  }

  public getServer() {
    return this.server;
  }

  public getPort() {
    return process.env.MIDWAY_HTTP_PORT;
  }

  public getFrameworkName() {
    return 'midway:express';
  }
}
