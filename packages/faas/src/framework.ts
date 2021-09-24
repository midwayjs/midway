import {
  FaaSContext,
  FaaSMiddleware,
  IFaaSConfigurationOptions,
  IMidwayFaaSApplication,
  IWebMiddleware,
} from './interface';
import {
  BaseFramework,
  extractKoaLikeValue,
  IMiddleware,
  IMidwayBootstrapOptions,
  MidwayFrameworkType,
  REQUEST_OBJ_CTX_KEY,
  RouterInfo,
  ServerlessTriggerCollector,
} from '@midwayjs/core';

import {
  LOGGER_KEY,
  PLUGIN_KEY,
  WEB_RESPONSE_HTTP_CODE,
  WEB_RESPONSE_HEADER,
  WEB_RESPONSE_CONTENT_TYPE,
  WEB_RESPONSE_REDIRECT,
} from '@midwayjs/decorator';
import SimpleLock from '@midwayjs/simple-lock';
import * as compose from 'koa-compose';
import { createConsoleLogger, LoggerOptions, loggers } from '@midwayjs/logger';

const LOCK_KEY = '_faas_starter_start_key';

export class MidwayFaaSFramework extends BaseFramework<
  IMidwayFaaSApplication,
  FaaSContext,
  IFaaSConfigurationOptions
> {
  protected defaultHandlerMethod = 'handler';
  private globalMiddleware: string[];
  protected funMappingStore: Map<string, RouterInfo> = new Map();
  protected logger;
  private lock = new SimpleLock();
  public app: IMidwayFaaSApplication;
  private isReplaceLogger =
    process.env['MIDWAY_SERVERLESS_REPLACE_LOGGER'] === 'true';

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.globalMiddleware = this.configurationOptions.middleware || [];
    this.app =
      this.configurationOptions.applicationAdapter?.getApplication() ||
      ({} as IMidwayFaaSApplication);

    this.defineApplicationProperties({
      /**
       * return init context value such as aliyun fc
       */
      getInitializeContext: () => {
        return this.configurationOptions.initializeContext;
      },

      useMiddleware: async middlewares => {
        if (middlewares.length) {
          const newMiddlewares = await this.loadMiddleware(middlewares);
          for (const mw of newMiddlewares) {
            this.app.use(mw);
          }
        }
      },

      generateMiddleware: async (middlewareId: string) => {
        return this.generateMiddleware(middlewareId);
      },

      getFunctionName: () => {
        return this.configurationOptions.applicationAdapter?.getFunctionName();
      },

      getFunctionServiceName: () => {
        return this.configurationOptions.applicationAdapter?.getFunctionServiceName();
      },
    });
  }

  protected async initializeLogger(options: IMidwayBootstrapOptions) {
    if (!this.logger) {
      this.logger =
        options.logger ||
        createConsoleLogger('midwayServerlessLogger', {
          printFormat: info => {
            const requestId =
              info.ctx?.['originContext']?.['requestId'] ??
              info.ctx?.['originContext']?.['request_id'] ??
              '';
            return `${new Date().toISOString()} ${requestId} [${info.level}] ${
              info.message
            }`;
          },
        });
      this.appLogger = this.logger;
      loggers.addLogger('coreLogger', this.logger, false);
      loggers.addLogger('appLogger', this.logger, false);
      loggers.addLogger('logger', this.logger, false);
    }
  }

  protected async afterContainerReady(
    options: Partial<IMidwayBootstrapOptions>
  ) {
    this.registerDecorator();
  }

  public async run() {
    return this.lock.sureOnce(async () => {
      // attach global middleware from user config
      if (this.app?.use) {
        const middlewares = this.app.getConfig('middleware') || [];
        await this.app.useMiddleware(middlewares);
        this.globalMiddleware = this.globalMiddleware.concat(
          this.app['middleware']
        );
      }

      // set app keys
      this.app['keys'] = this.app.getConfig('keys') || '';

      // store all http function entry
      const collector = new ServerlessTriggerCollector();
      const functionList = await collector.getFunctionList();
      for (const funcInfo of functionList) {
        this.funMappingStore.set(funcInfo.funcHandlerName, funcInfo);
      }

      // bind func and controller module
      const routerModules = await collector.getRouterModules();
      for (const module of routerModules) {
        this.getApplicationContext().bindClass(module);
      }
    }, LOCK_KEY);
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.FAAS;
  }

  public handleInvokeWrapper(handlerMapping: string) {
    const funOptions: RouterInfo = this.funMappingStore.get(handlerMapping);

    return async (...args) => {
      if (args.length === 0) {
        throw new Error('first parameter must be function context');
      }

      const context: FaaSContext = this.getContext(args.shift());

      if (funOptions) {
        let fnMiddlewere = [];
        // invoke middleware, just for http
        if (context.headers && context.get) {
          fnMiddlewere = fnMiddlewere
            .concat(this.globalMiddleware)
            .concat(funOptions.controllerMiddleware);
        }
        fnMiddlewere = fnMiddlewere.concat(funOptions.middleware);
        if (fnMiddlewere.length) {
          const mw: any[] = await this.loadMiddleware(fnMiddlewere);
          mw.push(async (ctx, next) => {
            // invoke handler
            const result = await this.invokeHandler(
              funOptions,
              ctx,
              next,
              args
            );
            if (result !== undefined) {
              ctx.body = result;
            }
            return next();
          });
          return compose(mw)(context).then(() => {
            return context.body;
          });
        } else {
          // invoke handler
          return this.invokeHandler(funOptions, context, null, args);
        }
      }

      throw new Error(`function handler = ${handlerMapping} not found`);
    };
  }

  public async generateMiddleware(
    middlewareId: string
  ): Promise<FaaSMiddleware> {
    const mwIns = await this.getApplicationContext().getAsync<IWebMiddleware>(
      middlewareId
    );
    return mwIns.resolve();
  }

  public getContext(context) {
    if (!context.env) {
      context.env = this.getApplicationContext()
        .getEnvironmentService()
        .getCurrentEnvironment();
    }

    if (this.isReplaceLogger || !context.logger) {
      context._serverlessLogger = this.createContextLogger(context);
      /**
       * 由于 fc 的 logger 有 bug，FC公有云环境我们会默认替换掉，其他平台后续视情况而定
       */
      Object.defineProperty(context, 'logger', {
        get() {
          return context._serverlessLogger;
        },
      });
    }
    this.app.createAnonymousContext(context);
    return context;
  }

  private async invokeHandler(routerInfo: RouterInfo, context, next, args) {
    if (
      Array.isArray(routerInfo.requestMetadata) &&
      routerInfo.requestMetadata.length
    ) {
      await Promise.all(
        routerInfo.requestMetadata.map(
          async ({ index, type, propertyData }) => {
            args[index] = await extractKoaLikeValue(type, propertyData)(
              context,
              next
            );
          }
        )
      );
    }
    const funModule = await context.requestContext.getAsync(
      routerInfo.controllerId
    );
    const handlerName =
      this.getFunctionHandler(context, args, funModule, routerInfo.method) ||
      this.defaultHandlerMethod;
    if (funModule[handlerName]) {
      // invoke real method
      const result = await funModule[handlerName](...args);
      // implement response decorator
      const routerResponseData = routerInfo.responseMetadata;
      if (context.headers && routerResponseData.length) {
        for (const routerRes of routerResponseData) {
          switch (routerRes.type) {
            case WEB_RESPONSE_HTTP_CODE:
              context.status = routerRes.code;
              break;
            case WEB_RESPONSE_HEADER:
              for (const key in routerRes?.setHeaders || {}) {
                context.set(key, routerRes.setHeaders[key]);
              }
              break;
            case WEB_RESPONSE_CONTENT_TYPE:
              context.type = routerRes.contentType;
              break;
            case WEB_RESPONSE_REDIRECT:
              context.status = routerRes.code;
              context.redirect(routerRes.url);
              return;
          }
        }
      }
      return result;
    }
  }

  protected getFunctionHandler(ctx, args, target, method): string {
    if (method && typeof target[method] !== 'undefined') {
      return method;
    }
    const handlerMethod = this.defaultHandlerMethod;
    if (handlerMethod && typeof target[handlerMethod] !== 'undefined') {
      return handlerMethod;
    }
    throw new Error(
      `no handler setup on ${target.name}#${
        method || this.defaultHandlerMethod
      }`
    );
  }

  private registerDecorator() {
    this.getApplicationContext().registerDataHandler(
      PLUGIN_KEY,
      (key, meta, target) => {
        return target?.[REQUEST_OBJ_CTX_KEY]?.[key] || this.app[key];
      }
    );

    this.getApplicationContext().registerDataHandler(
      LOGGER_KEY,
      (key, meta, target) => {
        return (
          target?.[REQUEST_OBJ_CTX_KEY]?.['logger'] || this.app.getLogger()
        );
      }
    );
  }

  private async loadMiddleware(middlewares) {
    const newMiddlewares = [];
    for (const middleware of middlewares) {
      if (typeof middleware === 'function') {
        newMiddlewares.push(middleware);
      } else {
        const middlewareImpl: IMiddleware<FaaSContext> =
          await this.getApplicationContext().getAsync(middleware);
        if (middlewareImpl && typeof middlewareImpl.resolve === 'function') {
          newMiddlewares.push(middlewareImpl.resolve() as any);
        }
      }
    }

    return newMiddlewares;
  }

  public createLogger(name: string, option: LoggerOptions = {}) {
    // 覆盖基类的创建日志对象，函数场景下的日志，即使自定义，也只启用控制台输出
    return createConsoleLogger(name, option);
  }

  public getFrameworkName() {
    return 'midway:faas';
  }
}
