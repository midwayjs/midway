import {
  CommonMiddlewareUnion,
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayBootstrapOptions,
  IMidwayContainer,
  IMidwayContext,
  IMidwayFramework,
  MidwayProcessTypeEnum,
  CommonExceptionFilterUnion,
} from './interface';
import {
  Inject,
  Destroy,
  Init,
  MidwayFrameworkType,
} from '@midwayjs/decorator';
import { ILogger, LoggerOptions, MidwayContextLogger } from '@midwayjs/logger';
import { MidwayRequestContainer } from './context/requestContainer';
import { MidwayEnvironmentService } from './service/environmentService';
import { MidwayConfigService } from './service/configService';
import { MidwayInformationService } from './service/informationService';
import { MidwayLoggerService } from './service/loggerService';
import { ContextMiddlewareManager } from './util/middlewareManager';
import { MidwayMiddlewareService } from './service/middlewareService';
import { ExceptionFilterManager } from './util/exceptionFilterManager';

export abstract class BaseFramework<
  APP extends IMidwayApplication<CTX>,
  CTX extends IMidwayContext,
  OPT extends IConfigurationOptions
> implements IMidwayFramework<APP, OPT>
{
  protected applicationContext: IMidwayContainer;
  protected logger: ILogger;
  protected appLogger: ILogger;
  public configurationOptions: OPT;
  public app: APP;
  protected defaultContext = {};
  protected BaseContextLoggerClass: any;
  protected middlewareManager = new ContextMiddlewareManager<CTX>();
  protected exceptionFilterManager = new ExceptionFilterManager<CTX>();
  private composeMiddleware = null;

  @Inject()
  loggerService: MidwayLoggerService;

  @Inject()
  environmentService: MidwayEnvironmentService;

  @Inject()
  configService: MidwayConfigService;

  @Inject()
  informationService: MidwayInformationService;

  @Inject()
  middlewareService: MidwayMiddlewareService<CTX>;

  @Init()
  async init() {
    this.configure(
      this.configService.getConfiguration(this.getFrameworkName())
    );
    this.BaseContextLoggerClass =
      this.configurationOptions.ContextLoggerClass ||
      this.getDefaultContextLoggerClass();
    this.logger = this.loggerService.getLogger('coreLogger');
    this.appLogger = this.loggerService.getLogger('logger');
    return this;
  }

  public configure(options?: OPT): BaseFramework<APP, CTX, OPT> {
    this.configurationOptions = options || ({} as OPT);
    return this;
  }

  public async initialize(options?: IMidwayBootstrapOptions): Promise<void> {
    this.configurationOptions = this.configurationOptions || ({} as OPT);
    this.applicationContext = options.applicationContext;

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

  protected async containerInitialize(options: IMidwayBootstrapOptions) {}
  protected async containerDirectoryLoad(options: IMidwayBootstrapOptions) {}
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

  public abstract getFrameworkType(): MidwayFrameworkType;

  public abstract run(): Promise<void>;

  protected setContextLoggerClass(BaseContextLogger: any) {
    this.BaseContextLoggerClass = BaseContextLogger;
  }

  protected createContextLogger(ctx: CTX, name?: string): ILogger {
    const appLogger = this.getLogger(name);
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
      useMiddleware: (middleware: CommonMiddlewareUnion<CTX>) => {
        this.middlewareManager.insertLast(middleware);
      },
      getMiddleware: (): ContextMiddlewareManager<CTX> => {
        return this.middlewareManager;
      },
      useFilter: (Filter: CommonExceptionFilterUnion<CTX>) => {
        this.exceptionFilterManager.useFilter(Filter);
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

  protected async beforeContainerInitialize(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {}

  protected async afterContainerInitialize(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {}

  protected async afterContainerDirectoryLoad(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {}

  protected async afterContainerReady(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {}

  protected async getMiddleware() {
    if (!this.composeMiddleware) {
      this.middlewareManager.insertFirst(async (ctx, next) => {
        let result = undefined;
        try {
          result = await next();
        } catch (err) {
          result = await this.exceptionFilterManager.run(err, ctx);
        }
        return result;
      });
      this.composeMiddleware = await this.middlewareService.compose(
        this.middlewareManager
      );
      await this.exceptionFilterManager.init(this.applicationContext);
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
    return this.getFrameworkType().toString();
  }

  public getDefaultContextLoggerClass(): any {
    return MidwayContextLogger;
  }

  public useMiddleware(Middleware: CommonMiddlewareUnion<CTX>) {
    this.middlewareManager.insertLast(Middleware);
  }

  public useFilter(Filter: CommonExceptionFilterUnion<CTX>) {
    this.exceptionFilterManager.useFilter(Filter);
  }
}
