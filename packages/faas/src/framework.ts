import {
  FaaSContext,
  FaaSMiddleware,
  IFaaSConfigurationOptions,
  IMidwayFaaSApplication,
  IWebMiddleware,
} from './interface';
import {
  BaseFramework,
  createMidwayLogger,
  getClassMetadata,
  IMiddleware,
  IMidwayBootstrapOptions,
  listModule,
  listPreloadModule,
  MidwayFrameworkType,
  MidwayRequestContainer,
  REQUEST_OBJ_CTX_KEY,
} from '@midwayjs/core';

import { dirname, resolve } from 'path';
import { FUNC_KEY, LOGGER_KEY, PLUGIN_KEY } from '@midwayjs/decorator';
import SimpleLock from '@midwayjs/simple-lock';
import * as compose from 'koa-compose';
import { MidwayHooks } from './hooks';
import { LoggerOptions, loggers } from '@midwayjs/logger';

const LOCK_KEY = '_faas_starter_start_key';

// const MIDWAY_FAAS_KEY = '__midway_faas__';

export class MidwayFaaSFramework extends BaseFramework<
  IMidwayFaaSApplication,
  IFaaSConfigurationOptions
> {
  protected defaultHandlerMethod = 'handler';
  private globalMiddleware: string[];
  protected funMappingStore: Map<string, any> = new Map();
  protected logger;
  private lock = new SimpleLock();
  public app: IMidwayFaaSApplication;

  protected async afterContainerInitialize(options: IMidwayBootstrapOptions) {
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

    this.prepareConfiguration();
  }

  protected async initializeLogger(options: IMidwayBootstrapOptions) {
    if (!this.logger) {
      this.logger =
        options.logger ||
        this.configurationOptions?.initializeContext?.['logger'] ||
        console;
      this.appLogger = this.logger;
      loggers.addLogger('coreLogger', this.logger);
      loggers.addLogger('appLogger', this.logger);
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

      // store all function entry
      const funModules = listModule(FUNC_KEY);

      for (const funModule of funModules) {
        const funOptions: Array<{
          funHandler;
          key;
          descriptor;
          middleware: string[];
        }> = getClassMetadata(FUNC_KEY, funModule);
        funOptions.map(opts => {
          // { method: 'handler', data: 'index.handler' }
          const handlerName = opts.funHandler
            ? // @Func(key), if key is set
              // or @Func({ handler })
              opts.funHandler
            : // else use ClassName.mehtod as handler key
              covertId(funModule.name, opts.key);
          this.funMappingStore.set(handlerName, {
            middleware: opts.middleware || [],
            mod: funModule,
            method: opts.key,
            descriptor: opts.descriptor,
          });
        });
      }

      const modules = listPreloadModule();
      for (const module of modules) {
        // preload init context
        await this.getApplicationContext().getAsync(module);
      }
    }, LOCK_KEY);
  }

  public getApplication() {
    return this.app;
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.FAAS;
  }

  public handleInvokeWrapper(handlerMapping: string) {
    const funOptions: {
      mod: any;
      middleware: Array<IMiddleware<FaaSContext>>;
      method: string;
      descriptor: any;
    } = this.funMappingStore.get(handlerMapping);

    return async (...args) => {
      if (args.length === 0) {
        throw new Error('first parameter must be function context');
      }

      const context: FaaSContext = this.getContext(args.shift());

      if (funOptions && funOptions.mod) {
        let fnMiddlewere = [];
        // invoke middleware, just for http
        if (context.headers && context.get) {
          fnMiddlewere = fnMiddlewere.concat(this.globalMiddleware);
        }
        fnMiddlewere = fnMiddlewere.concat(funOptions.middleware);
        if (fnMiddlewere.length) {
          const mw: any[] = await this.loadMiddleware(fnMiddlewere);
          mw.push(async (ctx, next) => {
            // invoke handler
            const result = await this.invokeHandler(funOptions, ctx, args);
            if (!ctx.body) {
              ctx.body = result;
            }
            return next();
          });
          return compose(mw)(context).then(() => {
            return context.body;
          });
        } else {
          // invoke handler
          return this.invokeHandler(funOptions, context, args);
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

  protected getContext(context) {
    if (!context.env) {
      context.env = this.getApplicationContext()
        .getEnvironmentService()
        .getCurrentEnvironment();
    }
    if (!context.logger) {
      context.logger = this.logger;
    }
    if (!context.requestContext) {
      context.requestContext = new MidwayRequestContainer(
        context,
        this.getApplicationContext()
      );
    }
    if (!context.hooks) {
      context.hooks = new MidwayHooks(context, this.app);
    }
    return context;
  }

  private async invokeHandler(
    funOptions: {
      mod: any;
      middleware: Array<IMiddleware<FaaSContext>>;
      method: string;
    },
    context,
    args
  ) {
    const funModule = await context.requestContext.getAsync(funOptions.mod);
    const handlerName =
      this.getFunctionHandler(context, args, funModule, funOptions.method) ||
      this.defaultHandlerMethod;
    if (funModule[handlerName]) {
      // invoke real method
      return funModule[handlerName](...args);
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

  protected addConfiguration(
    filePath: string,
    fileDir?: string,
    namespace?: string
  ) {
    if (!fileDir) {
      fileDir = dirname(resolve(filePath));
    }
    const container = this.getApplicationContext();
    const cfg = container.createConfiguration();
    cfg.namespace = namespace;
    cfg.loadConfiguration(require(filePath), fileDir);
  }

  /**
   * @deprecated
   * use this.addConfiguration
   */
  protected initConfiguration(filePath: string, fileDir?: string) {
    this.addConfiguration(filePath, fileDir);
  }

  /**
   * @deprecated
   * use this.addConfiguration
   */
  protected prepareConfiguration() {
    // TODO use initConfiguration
    // this.initConfiguration('./configuration', __dirname);
  }

  private registerDecorator() {
    this.getApplicationContext().registerDataHandler(
      PLUGIN_KEY,
      (key, target) => {
        return target[REQUEST_OBJ_CTX_KEY]?.[key] || this.app[key];
      }
    );

    this.getApplicationContext().registerDataHandler(
      LOGGER_KEY,
      (key, target) => {
        return target[REQUEST_OBJ_CTX_KEY]?.['logger'] || this.app.getLogger();
      }
    );
  }

  private async loadMiddleware(middlewares) {
    const newMiddlewares = [];
    for (const middleware of middlewares) {
      if (typeof middleware === 'function') {
        newMiddlewares.push(middleware);
      } else {
        const middlewareImpl: IMiddleware<FaaSContext> = await this.getApplicationContext().getAsync(
          middleware
        );
        if (middlewareImpl && typeof middlewareImpl.resolve === 'function') {
          newMiddlewares.push(middlewareImpl.resolve() as any);
        }
      }
    }

    return newMiddlewares;
  }

  async applicationInitialize(options: IMidwayBootstrapOptions) {}

  public createLogger(name: string, option: LoggerOptions = {}) {
    // 覆盖基类的创建日志对象，函数场景下的日志，即使自定义，也只启用控制台输出
    return createMidwayLogger(this, name, Object.assign(option, {
      disableFile: true,
      disableError: true,
    }));
  }
}

function covertId(cls, method) {
  return cls.replace(/^[A-Z]/, c => c.toLowerCase()) + '.' + method;
}
