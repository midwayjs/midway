import {
  BaseFramework,
  HTTP_SERVER_KEY,
  IMidwayBootstrapOptions,
  MiddlewareRespond,
  PathFileUtils,
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
import { getFreePort, sendData } from './util';
const debug = debuglog('midway:debug');

@Framework()
export class MidwayExpressFramework extends BaseFramework<
  IMidwayExpressApplication,
  Context,
  IMidwayExpressConfigurationOptions,
  Response,
  NextFunction
> {
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

    // 版本控制配置
    const versioningConfig = this.configurationOptions.versioning;

    // 如果启用版本控制，添加版本处理中间件
    if (versioningConfig?.enabled) {
      this.app.use(this.createVersioningMiddleware(versioningConfig));
    }

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

    const serverOptions = {
      ...this.configurationOptions,
      ...this.configurationOptions.serverOptions,
    };

    // https config
    if (serverOptions.key && serverOptions.cert) {
      serverOptions.key = PathFileUtils.getFileContentSync(serverOptions.key);
      serverOptions.cert = PathFileUtils.getFileContentSync(serverOptions.cert);
      serverOptions.ca = PathFileUtils.getFileContentSync(serverOptions.ca);
      process.env.MIDWAY_HTTP_SSL = 'true';

      if (serverOptions.http2) {
        this.server = require('http2').createSecureServer(
          serverOptions,
          this.app
        );
      } else {
        this.server = require('https').createServer(serverOptions, this.app);
      }
    } else {
      if (serverOptions.http2) {
        this.server = require('http2').createServer(serverOptions, this.app);
      } else {
        this.server = require('http').createServer(serverOptions, this.app);
      }
    }
    // register httpServer to applicationContext
    this.applicationContext.registerObject(HTTP_SERVER_KEY, this.server);

    this.configurationOptions.listenOptions = {
      port: this.configurationOptions.port,
      host: this.configurationOptions.hostname,
      ...this.configurationOptions.listenOptions,
    };

    // set port and listen server
    let customPort: string | number =
      process.env.MIDWAY_HTTP_PORT ||
      this.configurationOptions.listenOptions.port;

    if (customPort === 0 || customPort === '0') {
      customPort = await getFreePort();
      this.logger.info(`[midway:express] detect available port: ${customPort}`);
    }

    this.configurationOptions.listenOptions.port = Number(customPort);

    if (this.configurationOptions.listenOptions.port) {
      new Promise<void>(resolve => {
        // 使用 ListenOptions 对象启动服务器
        this.server.listen(this.configurationOptions.listenOptions, () => {
          resolve();
        });

        process.env.MIDWAY_HTTP_PORT = String(
          this.configurationOptions.listenOptions.port
        );
        this.logger.debug(
          `[midway:express] Server listening on http://${
            this.configurationOptions.hostname || 'localhost'
          }:${customPort}`
        );
      });
    }
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
        `[midway:express] Load Controller "${routerInfo.controllerId}", prefix=${routerInfo.prefix}`
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
          `[midway:express] Load Router "${routeInfo.requestMethod.toUpperCase()} ${
            routeInfo.url
          }"`
        );

        // apply controller from request context
        newRouter[routeInfo.requestMethod.toLowerCase()].call(
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
        process.env.MIDWAY_HTTP_PORT = '';
      });
      this.logger.debug('[midway:express] server close');
    }
  }

  public getServer() {
    return this.server;
  }

  public getPort(): string {
    return process.env.MIDWAY_HTTP_PORT;
  }

  public getFrameworkName() {
    return 'express';
  }

  private createVersioningMiddleware(config: any) {
    return (req: Context, res: Response, next: NextFunction) => {
      // 提取版本信息
      const version = this.extractVersion(req, config);
      req.apiVersion = version;

      // 对于 URI 版本控制，重写路径
      if (config.type === 'URI' && version) {
        const versionPrefix = `/${config.prefix || 'v'}${version}`;
        if (req.path.startsWith(versionPrefix)) {
          req.originalPath = req.path;
          // Express 中需要修改 url 而不是 path
          req.url = req.url.replace(versionPrefix, '') || '/';
        }
      }

      next();
    };
  }

  private extractVersion(req: Context, config: any): string | undefined {
    // 自定义提取函数优先
    if (config.extractVersionFn) {
      return config.extractVersionFn(req);
    }

    const type = config.type || 'URI';

    switch (type) {
      case 'HEADER': {
        const headerName = config.header || 'x-api-version';
        const headerValue = req.headers[headerName];
        if (typeof headerValue === 'string') {
          return headerValue.replace(/^v/, '');
        }
        return undefined;
      }

      case 'MEDIA_TYPE': {
        const accept = req.headers.accept;
        const paramName = config.mediaTypeParam || 'version';
        const match = accept?.match(new RegExp(`${paramName}=(\\\\d+)`));
        return match ? match[1] : undefined;
      }

      case 'URI': {
        const prefix = config.prefix || 'v';
        const uriMatch = req.path.match(new RegExp(`^/${prefix}(\\\\d+)`));
        return uriMatch ? uriMatch[1] : undefined;
      }

      default:
        return config.defaultVersion;
    }
  }
}
