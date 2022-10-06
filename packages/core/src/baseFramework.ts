import {
  CommonMiddlewareUnion,
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayBootstrapOptions,
  IMidwayContainer,
  IMidwayContext,
  IMidwayFramework,
  MidwayProcessTypeEnum,
  CommonFilterUnion,
  MiddlewareRespond,
  CommonGuardUnion,
} from './interface';
import {
  REQUEST_CTX_LOGGER_CACHE_KEY,
  ASYNC_CONTEXT_KEY,
  ASYNC_CONTEXT_MANAGER_KEY,
} from './constants';
import { Inject, Destroy, Init } from './decorator';
import {
  ILogger,
  LoggerOptions,
  IMidwayLogger,
  LoggerContextFormat,
} from '@midwayjs/logger';
import { MidwayRequestContainer } from './context/requestContainer';
import { MidwayEnvironmentService } from './service/environmentService';
import { MidwayConfigService } from './service/configService';
import { MidwayInformationService } from './service/informationService';
import { MidwayLoggerService } from './service/loggerService';
import { ContextMiddlewareManager } from './common/middlewareManager';
import { MidwayMiddlewareService } from './service/middlewareService';
import { FilterManager } from './common/filterManager';
import { MidwayMockService } from './service/mockService';
import * as util from 'util';
import {
  ASYNC_ROOT_CONTEXT,
  AsyncContextManager,
  NoopContextManager,
} from './common/asyncContextManager';
import { GuardManager } from './common/guardManager';
const debug = util.debuglog('midway:debug');

export abstract class BaseFramework<
  APP extends IMidwayApplication<CTX>,
  CTX extends IMidwayContext,
  OPT extends IConfigurationOptions,
  ResOrNext = unknown,
  Next = unknown
> implements IMidwayFramework<APP, CTX, OPT, ResOrNext, Next>
{
  public app: APP;
  public configurationOptions: OPT;
  protected logger: ILogger;
  protected appLogger: ILogger;
  protected defaultContext = {};
  protected contextLoggerApplyLogger: string;
  protected contextLoggerFormat: LoggerContextFormat;
  protected middlewareManager = this.createMiddlewareManager();
  protected filterManager = this.createFilterManager();
  protected guardManager = this.createGuardManager();
  protected composeMiddleware = null;
  protected bootstrapOptions: IMidwayBootstrapOptions;
  protected asyncContextManager: AsyncContextManager;

  @Inject()
  loggerService: MidwayLoggerService;

  @Inject()
  environmentService: MidwayEnvironmentService;

  @Inject()
  configService: MidwayConfigService;

  @Inject()
  informationService: MidwayInformationService;

  @Inject()
  middlewareService: MidwayMiddlewareService<CTX, ResOrNext, Next>;

  @Inject()
  mockService: MidwayMockService;

  constructor(readonly applicationContext: IMidwayContainer) {}

  @Init()
  async init() {
    this.configurationOptions = this.configure() ?? ({} as OPT);
    this.contextLoggerApplyLogger =
      this.configurationOptions.contextLoggerApplyLogger ?? 'appLogger';
    this.contextLoggerFormat = this.configurationOptions.contextLoggerFormat;
    this.logger = this.loggerService.getLogger('coreLogger');
    this.appLogger = this.loggerService.getLogger('appLogger');
    return this;
  }

  abstract configure(options?: OPT);

  isEnable(): boolean {
    return true;
  }

  public async initialize(options?: IMidwayBootstrapOptions): Promise<void> {
    this.bootstrapOptions = options;
    await this.beforeContainerInitialize(options);
    await this.containerInitialize(options);
    await this.afterContainerInitialize(options);
    await this.containerDirectoryLoad(options);
    await this.afterContainerDirectoryLoad(options);

    /**
     * Third party application initialization
     */
    await this.applicationInitialize(options);
    await this.containerReady(options);
    await this.afterContainerReady(options);
  }

  /**
   * @deprecated
   */
  protected async containerInitialize(options: IMidwayBootstrapOptions) {}
  /**
   * @deprecated
   */
  protected async containerDirectoryLoad(options: IMidwayBootstrapOptions) {}
  /**
   * @deprecated
   */
  protected async containerReady(options: IMidwayBootstrapOptions) {
    if (!this.app.getApplicationContext) {
      this.defineApplicationProperties();
    }
  }

  public getApplicationContext(): IMidwayContainer {
    return this.applicationContext;
  }

  public getConfiguration(key?: string): any {
    return this.configService.getConfiguration(key);
  }

  public getCurrentEnvironment() {
    return this.environmentService.getCurrentEnvironment();
  }

  public getApplication(): APP {
    return this.app;
  }

  public abstract applicationInitialize(options: IMidwayBootstrapOptions);

  public abstract run(): Promise<void>;

  protected createContextLogger(ctx: CTX, name?: string): ILogger {
    const appLogger = this.getLogger(
      name ?? this.contextLoggerApplyLogger
    ) as IMidwayLogger;
    if (name) {
      let ctxLoggerCache = ctx.getAttr(REQUEST_CTX_LOGGER_CACHE_KEY) as Map<
        string,
        ILogger
      >;
      if (!ctxLoggerCache) {
        ctxLoggerCache = new Map();
        ctx.setAttr(REQUEST_CTX_LOGGER_CACHE_KEY, ctxLoggerCache);
      }

      if (!name) {
        name = 'appLogger';
      }

      // if logger exists
      if (ctxLoggerCache.has(name)) {
        return ctxLoggerCache.get(name);
      }

      // create new context logger
      const ctxLogger = appLogger.createContextLogger<CTX>(ctx, {
        contextFormat: this.contextLoggerFormat,
      });
      ctxLoggerCache.set(name, ctxLogger);
      return ctxLogger;
    } else {
      // avoid maximum call stack size exceeded
      if (ctx['_logger']) {
        return ctx['_logger'];
      }
      ctx['_logger'] = appLogger.createContextLogger<CTX>(ctx, {
        contextFormat: this.contextLoggerFormat,
      });
      return ctx['_logger'];
    }
  }

  @Destroy()
  public async stop(): Promise<void> {
    await this.beforeStop();
  }

  public getAppDir(): string {
    return this.informationService.getAppDir();
  }

  public getBaseDir(): string {
    return this.informationService.getBaseDir();
  }

  protected defineApplicationProperties(
    applicationProperties = {},
    whiteList: string[] = []
  ) {
    const defaultApplicationProperties = {
      getBaseDir: () => {
        return this.getBaseDir();
      },

      getAppDir: () => {
        return this.getAppDir();
      },

      getEnv: () => {
        return this.getCurrentEnvironment();
      },

      getApplicationContext: () => {
        return this.getApplicationContext();
      },

      getConfig: (key?: string) => {
        return this.getConfiguration(key);
      },

      getFrameworkType: () => {
        if (this['getFrameworkType']) {
          return this['getFrameworkType']();
        }
      },

      getProcessType: () => {
        return MidwayProcessTypeEnum.APPLICATION;
      },

      getCoreLogger: () => {
        return this.getCoreLogger();
      },

      getLogger: (name?: string) => {
        return this.getLogger(name);
      },

      createLogger: (name: string, options: LoggerOptions = {}) => {
        return this.createLogger(name, options);
      },

      getFramework: () => {
        return this;
      },

      getProjectName: () => {
        return this.getProjectName();
      },

      createAnonymousContext: (extendCtx?: CTX) => {
        const ctx = extendCtx || Object.create(this.defaultContext);
        if (!ctx.startTime) {
          ctx.startTime = Date.now();
        }
        if (!ctx.logger) {
          ctx.logger = this.createContextLogger(ctx);
        }
        if (!ctx.requestContext) {
          ctx.requestContext = new MidwayRequestContainer(
            ctx,
            this.getApplicationContext()
          );
          ctx.requestContext.ready();
        }
        if (!ctx.getLogger) {
          ctx.getLogger = name => {
            return this.createContextLogger(ctx, name);
          };
        }
        ctx.setAttr = (key: string, value: any) => {
          ctx.requestContext.setAttr(key, value);
        };
        ctx.getAttr = <T>(key: string): T => {
          return ctx.requestContext.getAttr(key);
        };
        return ctx;
      },

      addConfigObject: (obj: any) => {
        this.configService.addObject(obj);
      },

      setAttr: (key: string, value: any) => {
        this.getApplicationContext().setAttr(key, value);
      },

      getAttr: <T>(key: string): T => {
        return this.getApplicationContext().getAttr(key);
      },

      useMiddleware: (
        middleware: CommonMiddlewareUnion<CTX, ResOrNext, Next>
      ) => {
        return this.useMiddleware(middleware);
      },

      getMiddleware: (): ContextMiddlewareManager<CTX, ResOrNext, Next> => {
        return this.getMiddleware();
      },

      useFilter: (Filter: CommonFilterUnion<CTX, ResOrNext, Next>) => {
        return this.useFilter(Filter);
      },

      useGuard: (guard: CommonGuardUnion<CTX>) => {
        return this.useGuard(guard);
      },
    };
    for (const method of whiteList) {
      delete defaultApplicationProperties[method];
    }
    Object.assign(
      this.app,
      defaultApplicationProperties,
      applicationProperties
    );
  }

  protected async beforeStop(): Promise<void> {}
  /**
   * @deprecated
   */
  protected async beforeContainerInitialize(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {}
  /**
   * @deprecated
   */
  protected async afterContainerInitialize(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {}
  /**
   * @deprecated
   */
  protected async afterContainerDirectoryLoad(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {}
  /**
   * @deprecated
   */
  protected async afterContainerReady(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {}

  public async applyMiddleware<R, N>(
    lastMiddleware?: CommonMiddlewareUnion<CTX, R, N>
  ): Promise<MiddlewareRespond<CTX, R, N>> {
    if (!this.composeMiddleware) {
      if (!this.applicationContext.hasObject(ASYNC_CONTEXT_MANAGER_KEY)) {
        const asyncContextManagerEnabled =
          this.configService.getConfiguration('asyncContextManager.enable') ||
          false;

        const contextManager: AsyncContextManager = asyncContextManagerEnabled
          ? this.bootstrapOptions?.asyncContextManager ||
            new NoopContextManager()
          : new NoopContextManager();

        if (asyncContextManagerEnabled) {
          contextManager.enable();
        }
        this.applicationContext.registerObject(
          ASYNC_CONTEXT_MANAGER_KEY,
          contextManager
        );
      }
      this.middlewareManager.insertFirst((async (ctx: any, next: any) => {
        // warp with context manager
        const rootContext = ASYNC_ROOT_CONTEXT.setValue(ASYNC_CONTEXT_KEY, ctx);
        const contextManager: AsyncContextManager = this.applicationContext.get(
          ASYNC_CONTEXT_MANAGER_KEY
        );
        return await contextManager.with(rootContext, async () => {
          this.mockService.applyContextMocks(this.app, ctx);
          let returnResult = undefined;
          try {
            const result = await next();
            returnResult = await this.filterManager.runResultFilter(
              result,
              ctx
            );
          } catch (err) {
            returnResult = await this.filterManager.runErrorFilter(err, ctx);
          }
          if (returnResult.error) {
            throw returnResult.error;
          }
          return returnResult.result;
        });
      }) as any);
      debug(
        `[core]: Compose middleware = [${this.middlewareManager.getNames()}]`
      );
      this.composeMiddleware = await this.middlewareService.compose(
        this.middlewareManager,
        this.app
      );
      await this.filterManager.init(this.applicationContext);
    }
    if (lastMiddleware) {
      lastMiddleware = Array.isArray(lastMiddleware)
        ? lastMiddleware
        : [lastMiddleware];
      return await this.middlewareService.compose(
        [this.composeMiddleware, ...lastMiddleware],
        this.app
      );
    }
    return this.composeMiddleware;
  }

  public getLogger(name?: string) {
    return this.loggerService.getLogger(name) ?? this.appLogger;
  }

  public getCoreLogger() {
    return this.logger;
  }

  public createLogger(name: string, option: LoggerOptions = {}) {
    return this.loggerService.createLogger(name, option);
  }

  public getProjectName() {
    return this.informationService.getProjectName();
  }

  public getFrameworkName() {
    return this.constructor.name;
  }

  public useMiddleware(
    middleware: CommonMiddlewareUnion<CTX, ResOrNext, Next>
  ) {
    this.middlewareManager.insertLast(middleware);
  }

  public getMiddleware(): ContextMiddlewareManager<CTX, ResOrNext, Next> {
    return this.middlewareManager;
  }

  public useFilter(filter: CommonFilterUnion<CTX, ResOrNext, Next>) {
    return this.filterManager.useFilter(filter);
  }

  public useGuard(guards: CommonGuardUnion<CTX>) {
    return this.guardManager.addGlobalGuard(guards);
  }

  public async runGuard(
    ctx: CTX,
    supplierClz: new (...args) => any,
    methodName: string
  ): Promise<boolean> {
    return this.guardManager.runGuard(ctx, supplierClz, methodName);
  }

  protected createMiddlewareManager() {
    return new ContextMiddlewareManager<CTX, ResOrNext, Next>();
  }

  protected createFilterManager() {
    return new FilterManager<CTX, ResOrNext, Next>();
  }

  protected createGuardManager() {
    return new GuardManager<CTX>();
  }
}
