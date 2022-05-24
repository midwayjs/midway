import {
  Context,
  IFaaSConfigurationOptions,
  Application,
  NextFunction,
} from './interface';
import {
  BaseFramework,
  CommonMiddlewareUnion,
  ContextMiddlewareManager,
  FunctionMiddleware,
  IMidwayBootstrapOptions,
  initializeGlobalApplicationContext,
  MidwayEnvironmentService,
  MidwayFrameworkType,
  MidwayMiddlewareService,
  pathToRegexp,
  RouterInfo,
  ServerlessTriggerCollector,
} from '@midwayjs/core';
import {
  Framework,
  Inject,
  WEB_RESPONSE_CONTENT_TYPE,
  WEB_RESPONSE_HEADER,
  WEB_RESPONSE_HTTP_CODE,
  WEB_RESPONSE_REDIRECT,
} from '@midwayjs/decorator';
import SimpleLock from '@midwayjs/simple-lock';
import { createConsoleLogger, LoggerOptions, loggers } from '@midwayjs/logger';
import {
  Application as HttpApplication,
  HTTPRequest,
  HTTPResponse,
} from '@midwayjs/serverless-http-parser';
import * as http from 'http';

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
  private serverlessRoutes = [];
  private server: http.Server;
  private respond: (req, res, respond) => void;
  private applicationAdapter: IFaaSConfigurationOptions['applicationAdapter'];
  protected httpMiddlewareManager = this.createMiddlewareManager();
  protected eventMiddlewareManager = this.createMiddlewareManager();

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
    this.applicationAdapter = this.configurationOptions.applicationAdapter;
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
        return this.configurationOptions.applicationAdapter?.getFunctionName();
      },

      getFunctionServiceName: () => {
        return this.configurationOptions.applicationAdapter?.getFunctionServiceName();
      },
      useEventMiddleware: () => {},
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
    return this.lock.sureOnce(async () => {
      // set app keys
      this.app['keys'] = this.configService.getConfiguration('keys') ?? '';

      // store all http function entry
      const collector = new ServerlessTriggerCollector();
      const functionList = await collector.getFunctionList();
      for (const funcInfo of functionList) {
        // store handler
        this.funMappingStore.set(funcInfo.funcHandlerName, funcInfo);
        if (funcInfo.url) {
          // store router
          this.serverlessRoutes.push({
            matchPattern: pathToRegexp(funcInfo.url, [], { end: false }),
            funcInfo: funcInfo,
          });
        }
      }

      this.respond = this.app.callback();

      if (this.environmentService.isDevelopmentEnvironment()) {
        const faasConfig = this.configService.getConfiguration('faas') ?? {};
        this.server = await new Promise(resolve => {
          const server = http.createServer((req, res) => {
            const url = new URL(req.url, `http://${req.headers.host}`);
            // create event and invoke
            this.handleInvokeWrapper(url.pathname)(req, res, {});
          });
          if (faasConfig['port']) {
            server.listen(faasConfig['port']);
          }
          resolve(server);
        });
      }
    }, LOCK_KEY);
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.FAAS;
  }

  public handleInvokeWrapper(handlerMapping: string) {
    let funOptions: RouterInfo = this.funMappingStore.get(handlerMapping);

    return async (...args) => {
      if (args.length === 0) {
        throw new Error('first parameter must be function context');
      }

      const event = args[0];
      const isLegacyMode = event.originContext && event.originEvent;
      const isHttpFunction =
        event.constructor.name === 'IncomingMessage' ||
        event.constructor.name === 'EventEmitter' ||
        !!(event.headers && event.get);

      if (!funOptions && isHttpFunction) {
        for (const item of this.serverlessRoutes) {
          if (item.matchPattern.test(event.path)) {
            funOptions = item.funcInfo;
            break;
          }
        }
      }

      if (!funOptions) {
        throw new Error(`function handler = ${handlerMapping} not found`);
      }

      let context;
      if (isLegacyMode) {
        context = this.getContext(args.shift());
      } else if (isHttpFunction) {
        const newReq =
          this.applicationAdapter?.runRequestHook(...args) ||
          new HTTPRequest(args[0], args[1]);
        const newRes = new HTTPResponse();
        context = this.getContext(await this.createHttpContext(newReq, newRes));
      } else {
        context = this.getContext(
          await this.applicationAdapter?.runEventHook(...args)
        );
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
                  ctx.body = result;
                }
                return result;
              },
            ],
            this.app
          );
          return await fn(ctx as Context, next);
        })
      )(context);

      if (isLegacyMode) {
        return result;
      } else if (isHttpFunction) {
        if (!context.response._explicitStatus) {
          if (context.body === null || context.body === 'undefined') {
            context.body = '';
            context.type = 'text';
            context.status = 204;
          }
        }

        let encoded = false;

        let data = context.body;
        if (typeof data === 'string') {
          if (!context.type) {
            context.type = 'text/plain';
          }
          context.body = data;
        } else if (Buffer.isBuffer(data)) {
          encoded = true;
          if (!context.type) {
            context.type = 'application/octet-stream';
          }

          // data is reserved as buffer
          context.body = data.toString('base64');
        } else if (typeof data === 'object') {
          if (!context.type) {
            context.type = 'application/json';
          }
          // set data to string
          context.body = data = JSON.stringify(data);
        } else {
          if (!context.type) {
            context.type = 'text/plain';
          }
          // set data to string
          context.body = data = data + '';
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
    };
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
}

export const createModuleServerlessFramework = async (
  globalOption: Omit<IMidwayBootstrapOptions, 'applicationContext'> &
    IFaaSConfigurationOptions
) => {
  const applicationContext = await initializeGlobalApplicationContext({
    ...globalOption,
    baseDir: '',
    appDir: '',
  });
  return applicationContext.get(MidwayFaaSFramework);
};
