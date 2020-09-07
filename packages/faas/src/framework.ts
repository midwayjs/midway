import {
  IFaaSConfigurationOptions,
  IFaaSApplication,
  FaaSContext,
} from './interface';
import {
  IMidwayApplication,
  IMidwayBootstrapOptions,
  getClassMetadata,
  IMiddleware,
  listModule,
  listPreloadModule,
  MidwayProcessTypeEnum,
  MidwayRequestContainer,
  REQUEST_OBJ_CTX_KEY,
  BaseFramework, MidwayFrameworkType,
} from '@midwayjs/core';

import { dirname, resolve } from 'path';
import {
  APPLICATION_KEY,
  FUNC_KEY,
  LOGGER_KEY,
  PLUGIN_KEY,
} from '@midwayjs/decorator';
import SimpleLock from '@midwayjs/simple-lock';
import * as compose from 'koa-compose';
import { MidwayHooks } from './hooks';

const LOCK_KEY = '_faas_starter_start_key';
// const MIDWAY_FAAS_KEY = '__midway_faas__';

export class MidwayFaaSFramework extends BaseFramework<IFaaSConfigurationOptions> {
  protected defaultHandlerMethod = 'handler';
  private globalMiddleware: string[];
  protected funMappingStore: Map<string, any> = new Map();
  protected logger;
  private lock = new SimpleLock();
  private webApplication: IFaaSApplication;

  protected async beforeDirectoryLoad(options: Partial<IMidwayBootstrapOptions>) {
    this.logger = options.logger || console;
    this.globalMiddleware = this.configurationOptions.middleware || [];
    this.webApplication = this.defineApplicationProperties(
      this.configurationOptions.applicationAdapter?.getApplication() || {}
    );

    this.prepareConfiguration();
  }

  protected async afterInitialize(options: Partial<IMidwayBootstrapOptions>) {
    this.registerDecorator();
  }

  public async run() {
    return this.lock.sureOnce(async () => {
      // attach global middleware from user config
      if (this.webApplication?.use) {
        const middlewares = this.webApplication.getConfig('middleware') || [];
        await this.webApplication.useMiddleware(middlewares);
        this.globalMiddleware = this.globalMiddleware.concat(
          this.webApplication['middleware']
        );
      }

      // set app keys
      this.webApplication['keys'] = this.webApplication.getConfig('keys') || '';

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

  public async stop(): Promise<void> {}

  public getApplication(): IMidwayApplication {
    return this.webApplication;
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
      context.hooks = new MidwayHooks(context, this.webApplication);
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
      `no handler setup on ${target.name}#${method ||
        this.defaultHandlerMethod}`
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
    const container = this.containerLoader.getApplicationContext();
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

  private defineApplicationProperties(app): IFaaSApplication {
    return Object.assign(app, {
      getBaseDir: () => {
        return this.baseDir;
      },

      getAppDir: () => {
        return this.appDir;
      },

      getEnv: () => {
        return this.getApplicationContext()
          .getEnvironmentService()
          .getCurrentEnvironment();
      },

      getConfig: (key?: string) => {
        return this.getApplicationContext()
          .getConfigService()
          .getConfiguration(key);
      },

      getLogger: () => {
        return this.logger;
      },

      getFrameworkType: () => {
        return this.getFrameworkType();
      },

      getProcessType: () => {
        return MidwayProcessTypeEnum.APPLICATION;
      },
      /**
       * return init context value such as aliyun fc
       */
      getInitializeContext: () => {
        return this.configurationOptions.initializeContext;
      },

      getApplicationContext: () => {
        return this.getApplicationContext();
      },

      useMiddleware: async middlewares => {
        if (middlewares.length) {
          const newMiddlewares = await this.loadMiddleware(middlewares);
          for (const mw of newMiddlewares) {
            this.webApplication.use(mw);
          }
        }
      },
    });
  }

  private registerDecorator() {
    this.containerLoader.registerHook(APPLICATION_KEY, () => {
      return this.webApplication;
    });
    this.containerLoader.registerHook(PLUGIN_KEY, (key, target) => {
      return target[REQUEST_OBJ_CTX_KEY]?.[key] || this.webApplication[key];
    });

    this.containerLoader.registerHook(LOGGER_KEY, (key, target) => {
      return (
        target[REQUEST_OBJ_CTX_KEY]?.['logger'] ||
        this.webApplication.getLogger()
      );
    });
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
}

function covertId(cls, method) {
  return cls.replace(/^[A-Z]/, c => c.toLowerCase()) + '.' + method;
}
