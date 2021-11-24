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
  CommonMiddleware,
  MiddlewareRespond,
} from './interface';
import { Inject, Destroy, Init, FrameworkType } from '@midwayjs/decorator';
import { ILogger, LoggerOptions, MidwayContextLogger } from '@midwayjs/logger';
import { MidwayRequestContainer } from './context/requestContainer';
import { MidwayEnvironmentService } from './service/environmentService';
import { MidwayConfigService } from './service/configService';
import { MidwayInformationService } from './service/informationService';
import { MidwayLoggerService } from './service/loggerService';
import { ContextMiddlewareManager } from './common/middlewareManager';
import { MidwayMiddlewareService } from './service/middlewareService';
import { FilterManager } from './common/filterManager';

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
  protected BaseContextLoggerClass: any;
  protected ContextLoggerApplyLogger: string;
  protected middlewareManager = this.createMiddlewareManager();
  protected filterManager = this.createFilterManager();
  protected composeMiddleware = null;

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

  constructor(readonly applicationContext: IMidwayContainer) {}

  @Init()
  async init() {
    this.configurationOptions = this.configure() ?? ({} as OPT);
    this.BaseContextLoggerClass =
      this.configurationOptions.ContextLoggerClass ??
      this.getDefaultContextLoggerClass();
    this.ContextLoggerApplyLogger =
      this.configurationOptions.ContextLoggerApplyLogger ?? 'appLogger';
    this.logger = this.loggerService.getLogger('coreLogger');
    this.appLogger = this.loggerService.getLogger('appLogger');
    return this;
  }

  abstract configure(options?: OPT);

  isEnable(): boolean {
    return true;
  }

  public async initialize(options?: IMidwayBootstrapOptions): Promise<void> {
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

  public abstract getFrameworkType(): FrameworkType;

  public abstract run(): Promise<void>;

  public setContextLoggerClass(BaseContextLogger: any) {
    this.BaseContextLoggerClass = BaseContextLogger;
  }

  protected createContextLogger(ctx: CTX, name?: string): ILogger {
    const appLogger = this.getLogger(name ?? this.ContextLoggerApplyLogger);
    return new this.BaseContextLoggerClass(ctx, appLogger);
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
        return this.getFrameworkType();
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

      setContextLoggerClass: (BaseContextLogger: any) => {
        return this.setContextLoggerClass(BaseContextLogger);
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
        this.middlewareManager.insertLast(middleware);
      },
      getMiddleware: (): ContextMiddlewareManager<CTX, ResOrNext, Next> => {
        return this.middlewareManager;
      },
      useFilter: (Filter: CommonFilterUnion<CTX, ResOrNext, Next>) => {
        this.filterManager.useFilter(Filter);
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

  public async getMiddleware<R, N>(
    lastMiddleware?: CommonMiddleware<CTX, R, N>
  ): Promise<MiddlewareRespond<CTX, R, N>> {
    if (!this.composeMiddleware) {
      this.middlewareManager.insertFirst((async (ctx: any, next: any) => {
        let returnResult = undefined;
        try {
          const result = await next();
          returnResult = await this.filterManager.runResultFilter(result, ctx);
        } catch (err) {
          returnResult = await this.filterManager.runErrorFilter(err, ctx);
        }
        return returnResult;
      }) as any);
      this.composeMiddleware = await this.middlewareService.compose(
        this.middlewareManager
      );
      await this.filterManager.init(this.applicationContext);
    }
    if (lastMiddleware) {
      return await this.middlewareService.compose([
        this.composeMiddleware,
        lastMiddleware,
      ]);
    } else {
      return this.composeMiddleware;
    }
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
    return this.getFrameworkType().name;
  }

  public getDefaultContextLoggerClass(): any {
    return MidwayContextLogger;
  }

  public useMiddleware(
    Middleware: CommonMiddlewareUnion<CTX, ResOrNext, Next>
  ) {
    this.middlewareManager.insertLast(Middleware);
  }

  public useFilter(Filter: CommonFilterUnion<CTX, ResOrNext, Next>) {
    this.filterManager.useFilter(Filter);
  }

  protected createMiddlewareManager() {
    return new ContextMiddlewareManager<CTX, ResOrNext, Next>();
  }

  protected createFilterManager() {
    return new FilterManager<CTX, ResOrNext, Next>();
  }
}
