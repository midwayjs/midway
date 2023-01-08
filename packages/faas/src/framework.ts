import {
  Context,
  IFaaSConfigurationOptions,
  Application,
  NextFunction,
  HandlerOptions,
} from './interface';
import {
  BaseFramework,
  CommonMiddlewareUnion,
  ContextMiddlewareManager,
  FunctionMiddleware,
  IMidwayBootstrapOptions,
  MidwayEnvironmentService,
  MidwayFrameworkType,
  MidwayMiddlewareService,
  MidwayServerlessFunctionService,
  RouterInfo,
  PathToRegexpUtil,
  Framework,
  Inject,
  WEB_RESPONSE_CONTENT_TYPE,
  WEB_RESPONSE_HEADER,
  WEB_RESPONSE_HTTP_CODE,
  WEB_RESPONSE_REDIRECT,
  httpError,
  MidwayFeatureNotImplementedError,
} from '@midwayjs/core';
import SimpleLock from '@midwayjs/simple-lock';
import { createConsoleLogger, LoggerOptions, loggers } from '@midwayjs/logger';
import {
  Application as HttpApplication,
  HTTPRequest,
  HTTPResponse,
} from '@midwayjs/serverless-http-parser';
import * as http from 'http';
import { types } from 'util';

const { isAnyArrayBuffer, isUint8Array } = types;
const LOCK_KEY = '_faas_starter_start_key';

@Framework()
export class MidwayFaaSFramework extends BaseFramework<
  Application,
  Context,
  IFaaSConfigurationOptions
> {
  protected defaultHandlerMethod = 'handler';
  protected funMappingStore: Map<string, RouterInfo> = new Map();
  protected logger;
  private lock = new SimpleLock();
  public app: Application;
  private isReplaceLogger =
    process.env['MIDWAY_SERVERLESS_REPLACE_LOGGER'] === 'true';
  private developmentRun = false;
  private server: http.Server;
  private respond: (req, res, respond) => void;
  private applicationAdapter: IFaaSConfigurationOptions['applicationAdapter'];
  private serverlessFunctionService: MidwayServerlessFunctionService;
  protected httpMiddlewareManager = this.createMiddlewareManager();
  protected eventMiddlewareManager = this.createMiddlewareManager();
  private legacyVersion = false;
  private loadedFunction = false;

  @Inject()
  environmentService: MidwayEnvironmentService;

  @Inject()
  middlewareService: MidwayMiddlewareService<Context, any>;

  configure(options: IFaaSConfigurationOptions) {
    const faasConfig = this.configService.getConfiguration('faas') ?? {};
    if (options || faasConfig['developmentRun']) {
      this.developmentRun = true;
      this.configurationOptions = options;
    } else {
      return faasConfig;
    }
  }

  isEnable(): boolean {
    return !this.developmentRun;
  }

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    if (!this.logger) {
      this.logger = options.logger || loggers.getLogger('appLogger');
    }
    this.applicationAdapter =
      this.configurationOptions.applicationAdapter || ({} as any);

    if (this.applicationAdapter.getApplication) {
      this.legacyVersion = true;
    }

    this.app =
      this.applicationAdapter.getApplication?.() ||
      (new HttpApplication() as unknown as Application);

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
      generateMiddleware: async (middlewareId: any) => {
        return this.generateMiddleware(middlewareId);
      },

      getFunctionName: () => {
        return (
          process.env.MIDWAY_SERVERLESS_FUNCTION_NAME ||
          this.configurationOptions.applicationAdapter?.getFunctionName() ||
          ''
        );
      },

      /**
       * get function service/group in runtime
       */
      getFunctionServiceName: () => {
        return (
          process.env.MIDWAY_SERVERLESS_SERVICE_NAME ||
          this.configurationOptions.applicationAdapter?.getFunctionServiceName() ||
          ''
        );
      },
      useEventMiddleware: middleware => {
        return this.useEventMiddleware(middleware);
      },
      getEventMiddleware: () => {
        return this.getEventMiddleware();
      },
      getServerlessInstance: async () => {
        throw new MidwayFeatureNotImplementedError(
          'Please use it in by @midwayjs/mock in test.'
        );
      },
      invokeTriggerFunction: (
        context,
        handlerMapping: string,
        options: HandlerOptions
      ) => {
        return this.invokeTriggerFunction(context, handlerMapping, options);
      },
    });
    // hack use method
    (this.app as any).originUse = this.app.use;
    this.app.use = this.app.useMiddleware as any;

    if (this.configurationOptions.applicationAdapter?.runAppHook) {
      this.configurationOptions.applicationAdapter.runAppHook(
        this.app as unknown as Application
      );
    }
  }

  public async run() {
    if (this.legacyVersion) {
      return this.loadFunction();
    }
  }

  public async loadFunction() {
    if (!this.loadedFunction) {
      this.loadedFunction = true;
      return this.lock.sureOnce(async () => {
        // set app keys
        this.app['keys'] = this.configService.getConfiguration('keys') ?? '';
        // store all http function entry
        this.serverlessFunctionService = await this.applicationContext.getAsync(
          MidwayServerlessFunctionService
        );
        const functionList =
          await this.serverlessFunctionService.getFunctionList();
        for (const funcInfo of functionList) {
          // store handler
          this.funMappingStore.set(funcInfo.funcHandlerName, funcInfo);
        }

        this.respond = this.app.callback();
      }, LOCK_KEY);
    }
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.FAAS;
  }

  /**
   * @deprecated
   * @param handlerMapping
   */
  public handleInvokeWrapper(handlerMapping: string) {
    const funOptions: RouterInfo = this.funMappingStore.get(handlerMapping);

    return async (...args) => {
      if (args.length === 0) {
        throw new Error('first parameter must be function context');
      }

      if (!funOptions) {
        throw new Error(`function handler = ${handlerMapping} not found`);
      }

      const context: Context = this.getContext(args.shift());
      const isHttpFunction = !!(context.headers && context.get);
      const globalMiddlewareFn = await this.applyMiddleware();
      const middlewareManager = new ContextMiddlewareManager();

      middlewareManager.insertLast(globalMiddlewareFn);
      middlewareManager.insertLast(async (ctx, next) => {
        const fn = await this.middlewareService.compose(
          [
            ...(isHttpFunction
              ? this.httpMiddlewareManager
              : this.eventMiddlewareManager),
            ...funOptions.controllerMiddleware,
            ...funOptions.middleware,
            async (ctx, next) => {
              if (
                funOptions.controllerClz &&
                typeof funOptions.method === 'string'
              ) {
                const isPassed = await this.app
                  .getFramework()
                  .runGuard(ctx, funOptions.controllerClz, funOptions.method);
                if (!isPassed) {
                  throw new httpError.ForbiddenError();
                }
              }

              if (isHttpFunction) {
                args = [ctx];
              }
              // invoke handler
              const result = await this.invokeHandler(
                funOptions,
                ctx,
                args,
                isHttpFunction
              );
              if (isHttpFunction && result !== undefined) {
                if (result === null) {
                  // 这样设置可以绕过 koa 的 _explicitStatus 赋值机制
                  (ctx.response as any)._body = null;
                } else {
                  ctx.body = result;
                }
              }
              return result;
            },
          ],
          this.app
        );
        return await fn(ctx as Context, next);
      });
      const composeMiddleware = await this.middlewareService.compose(
        middlewareManager,
        this.app
      );

      return await composeMiddleware(context);
    };
  }

  public async invokeTriggerFunction(
    context,
    handlerMapping: string,
    options: HandlerOptions
  ) {
    let funOptions: RouterInfo = this.funMappingStore.get(handlerMapping);

    const isHttpFunction = options.isHttpFunction;
    if (!funOptions && isHttpFunction) {
      funOptions = await this.serverlessFunctionService.getMatchedRouterInfo(
        context.path,
        context.method
      );
      if (funOptions) {
        const matchRes = PathToRegexpUtil.match(
          funOptions.fullUrlFlattenString
        )(context.path);
        context.req.pathParameters = matchRes['params'] || {};
      }
    }
    if (!funOptions) {
      throw new Error(`function handler = ${handlerMapping} not found`);
    }

    context = this.getContext(context);

    if (this.configurationOptions.applicationAdapter?.runContextHook) {
      this.configurationOptions.applicationAdapter.runContextHook(context);
    }

    const result = await (
      await this.applyMiddleware(async (ctx, next) => {
        const fn = await this.middlewareService.compose(
          [
            ...(isHttpFunction
              ? this.httpMiddlewareManager
              : this.eventMiddlewareManager),
            ...funOptions.controllerMiddleware,
            ...funOptions.middleware,
            async (ctx, next) => {
              let args;
              if (isHttpFunction) {
                args = [ctx];
              } else {
                args = [ctx.originEvent, ctx.originContext];
              }
              // invoke handler
              const result = await this.invokeHandler(
                funOptions,
                ctx,
                args,
                isHttpFunction
              );
              if (isHttpFunction && result !== undefined) {
                if (result === null) {
                  // 这样设置可以绕过 koa 的 _explicitStatus 赋值机制
                  (ctx.response as any)._body = null;
                } else {
                  ctx.body = result;
                }
              }
              // http 靠 ctx.body，否则会出现状态码不正确的问题
              if (!isHttpFunction) {
                return result;
              }
            },
          ],
          this.app
        );
        return await fn(ctx as Context, next);
      })
    )(context);

    if (isHttpFunction) {
      if (!context.response?._explicitStatus) {
        if (context.body === null || context.body === 'undefined') {
          context.body = '';
          context.type = 'text';
          context.status = 204;
        }
      }

      let encoded = false;

      const data = context.body;
      if (typeof data === 'string') {
        if (!context.type) {
          context.type = 'text/plain';
        }
        context.body = data;
      } else if (isAnyArrayBuffer(data) || isUint8Array(data)) {
        encoded = true;
        if (!context.type) {
          context.type = 'application/octet-stream';
        }

        // data is reserved as buffer
        context.body = Buffer.from(data).toString('base64');
      } else if (typeof data === 'object') {
        if (!context.type) {
          context.type = 'application/json';
        }
        // set data to string
        context.body = JSON.stringify(data);
      } else {
        if (!context.type) {
          context.type = 'text/plain';
        }
        // set data to string
        context.body = data + '';
      }

      // middleware return value and will be got 204 status
      if (
        context.body === undefined &&
        !context.response._explicitStatus &&
        context._matchedRoute
      ) {
        // 如果进了路由，重新赋值，防止 404
        context.body = undefined;
      }

      return {
        isBase64Encoded: encoded,
        statusCode: context.status,
        headers: context.res.headers,
        body: context.body,
      };
    } else {
      return result;
    }
  }

  public async wrapHttpRequest(
    req: http.IncomingMessage | Record<string, any>,
    res?: http.ServerResponse
  ) {
    const newReq = res ? new HTTPRequest(req, res) : req;
    const newRes = new HTTPResponse();
    return this.createHttpContext(newReq, newRes);
  }

  /**
   * @deprecated
   * @param middlewareId
   */
  public async generateMiddleware(
    middlewareId: string
  ): Promise<FunctionMiddleware<Context, any>> {
    const mwIns: any = await this.getApplicationContext().getAsync(
      middlewareId
    );
    return mwIns.resolve();
  }

  public getContext(context: any = {}) {
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

  private async invokeHandler(
    routerInfo: RouterInfo,
    context,
    args,
    isHttpFunction: boolean
  ) {
    if (typeof routerInfo.method !== 'string') {
      if (!isHttpFunction) {
        args.unshift(context);
      }
      return routerInfo.method(...args);
    } else {
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
        if (isHttpFunction) {
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

  public getServer() {
    return this.server;
  }

  public async beforeStop() {
    if (this.server) {
      new Promise(resolve => {
        this.server.close(resolve);
      });
    }
  }

  protected async createHttpContext(req, res) {
    return new Promise(resolve => {
      this.respond(req, res, resolve);
    });
  }

  public useMiddleware(
    middleware: CommonMiddlewareUnion<Context, NextFunction, undefined>
  ) {
    this.httpMiddlewareManager.insertLast(middleware);
  }

  public useEventMiddleware(
    middleware: CommonMiddlewareUnion<Context, NextFunction, undefined>
  ) {
    this.eventMiddlewareManager.insertLast(middleware);
  }

  public getEventMiddleware(): ContextMiddlewareManager<
    Context,
    NextFunction,
    undefined
  > {
    return this.eventMiddlewareManager;
  }

  public getAllHandlerNames() {
    return Array.from(this.funMappingStore.keys());
  }
}
