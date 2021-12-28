import {
  BaseFramework,
  HTTP_SERVER_KEY,
  IMidwayBootstrapOptions,
  MiddlewareRespond,
  MidwayFrameworkType,
  PathFileUtil,
  WebRouterCollector,
  RouterInfo,
} from '@midwayjs/core';

import {
  Framework,
  WEB_RESPONSE_CONTENT_TYPE,
  WEB_RESPONSE_HEADER,
  WEB_RESPONSE_HTTP_CODE,
  WEB_RESPONSE_REDIRECT,
} from '@midwayjs/decorator';
import {
  IMidwayExpressApplication,
  IMidwayExpressConfigurationOptions,
  IMidwayExpressContext,
} from './interface';
import type { IRouter, IRouterHandler, Response, NextFunction } from 'express';
import * as express from 'express';
import { Server } from 'net';
import { MidwayExpressContextLogger } from './logger';
import {
  wrapAsyncHandler,
  MidwayExpressMiddlewareService,
} from './middlewareService';
import { debuglog } from 'util';
const debug = debuglog('midway:debug');

@Framework()
export class MidwayExpressFramework extends BaseFramework<
  IMidwayExpressApplication,
  IMidwayExpressContext,
  IMidwayExpressConfigurationOptions,
  Response,
  NextFunction
> {
  public app: IMidwayExpressApplication;
  private server: Server;
  private expressMiddlewareService: MidwayExpressMiddlewareService;

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
    this.app.use((req, res, next) => {
      const ctx = req as IMidwayExpressContext;
      this.app.createAnonymousContext(ctx);
      (req as any).requestContext = ctx.requestContext;
      ctx.requestContext.registerObject('req', req);
      ctx.requestContext.registerObject('res', res);
      next();
    });
  }

  public async run(): Promise<void> {
    debug(`[express]: use middlewares = "${this.getMiddleware().getNames()}"`);
    // use global middleware
    const globalMiddleware = await this.applyMiddleware();
    debug('[express]: use and apply all framework and global middleware');
    this.app.use(globalMiddleware as any);

    debug('[express]: use user router middleware');
    // load controller
    await this.loadMidwayController();

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
            this.sendData(res, result);
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
      const controller = await req.requestContext.getAsync(routeInfo.id);

      const result = await controller[routeInfo.method].call(
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

      this.sendData(res, returnValue);
    });
  }

  public async loadMidwayController(): Promise<void> {
    const collector = new WebRouterCollector('', {
      globalPrefix: this.configurationOptions.globalPrefix,
    });
    const routerTable = await collector.getRouterTable();
    const routerList = await collector.getRoutePriorityList();

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

      this.app.use(routerInfo.prefix, newRouter);
    }
  }

  /**
   * @param routerOptions
   */
  protected createRouter(routerOptions: { sensitive }): IRouter {
    return express.Router({ caseSensitive: routerOptions.sensitive });
  }

  public async applyMiddleware<Response, NextFunction>(): Promise<
    MiddlewareRespond<IMidwayExpressContext, Response, NextFunction>
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

  protected sendData(res, data) {
    if (typeof data === 'number') {
      res.status(res.statusCode).send('' + data);
    } else {
      res.status(res.statusCode).send(data);
    }
  }
}
