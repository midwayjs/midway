import {
  FaaSContext,
  IFaaSConfigurationOptions,
  IMidwayFaaSApplication,
} from './interface';
import {
  BaseFramework,
  FunctionMiddleware,
  IMidwayBootstrapOptions,
  MidwayEnvironmentService,
  MidwayFrameworkType,
  MidwayMiddlewareService,
  RouterInfo,
  ServerlessTriggerCollector,
} from '@midwayjs/core';
import {
  WEB_RESPONSE_HTTP_CODE,
  WEB_RESPONSE_HEADER,
  WEB_RESPONSE_CONTENT_TYPE,
  WEB_RESPONSE_REDIRECT,
  Provide,
  Inject,
  Framework,
} from '@midwayjs/decorator';
import SimpleLock from '@midwayjs/simple-lock';
import { createConsoleLogger, LoggerOptions, loggers } from '@midwayjs/logger';
import { ContextMiddlewareManager } from '@midwayjs/core/dist/util/middlewareManager';

const LOCK_KEY = '_faas_starter_start_key';

@Provide()
@Framework()
export class MidwayFaaSFramework extends BaseFramework<
  IMidwayFaaSApplication,
  FaaSContext,
  IFaaSConfigurationOptions
> {
  configure(options) {
    return options;
  }
  protected defaultHandlerMethod = 'handler';
  protected funMappingStore: Map<string, RouterInfo> = new Map();
  protected logger;
  private lock = new SimpleLock();
  public app: IMidwayFaaSApplication;
  private isReplaceLogger =
    process.env['MIDWAY_SERVERLESS_REPLACE_LOGGER'] === 'true';

  @Inject()
  environmentService: MidwayEnvironmentService;

  @Inject()
  middlewareService: MidwayMiddlewareService<FaaSContext>;

  async applicationInitialize(options: IMidwayBootstrapOptions) {
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

      /**
       * @deprecated
       * @param middlewareId
       */
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

  public async run() {
    return this.lock.sureOnce(async () => {
      //
      // if (this.app?.use) {
      //   const middlewares = this.app.getConfig('middleware') || [];
      //   await this.app.useMiddleware(middlewares);
      //   this.globalMiddleware = this.globalMiddleware.concat(
      //     this.app['middleware']
      //   );
      // }

      // set app keys
      this.app['keys'] = this.configService.getConfiguration('keys') || '';

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

      if (!funOptions) {
        throw new Error(`function handler = ${handlerMapping} not found`);
      }

      const context: FaaSContext = this.getContext(args.shift());
      const globalMiddlewareFn = await this.getMiddleware();
      const middlewareManager = new ContextMiddlewareManager();

      middlewareManager.insertLast(globalMiddlewareFn);
      middlewareManager.insertLast(async (ctx, next) => {
        const fn = await this.middlewareService.compose([
          ...funOptions.controllerMiddleware,
          ...funOptions.middleware,
          async (ctx, next) => {
            // invoke handler
            const result = await this.invokeHandler(funOptions, ctx, args);
            if (result !== undefined) {
              ctx.body = result;
            }
            return result;
          },
        ]);

        return await fn(ctx, next);
      });
      const composeMiddleware = await this.middlewareService.compose(
        middlewareManager
      );

      const { error, result } = await composeMiddleware(context);
      if (error) {
        throw error;
      }
      return result;
    };
  }

  /**
   * @deprecated
   * @param middlewareId
   */
  public async generateMiddleware(
    middlewareId: string
  ): Promise<FunctionMiddleware<FaaSContext>> {
    const mwIns: any = await this.getApplicationContext().getAsync(
      middlewareId
    );
    return mwIns.resolve();
  }

  public getContext(context) {
    if (!context.env) {
      context.env = this.environmentService.getCurrentEnvironment();
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

  private async invokeHandler(routerInfo: RouterInfo, context, args) {
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

  public createLogger(name: string, option: LoggerOptions = {}) {
    // 覆盖基类的创建日志对象，函数场景下的日志，即使自定义，也只启用控制台输出
    return createConsoleLogger(name, option);
  }

  public getFrameworkName() {
    return 'midway:faas';
  }
}
