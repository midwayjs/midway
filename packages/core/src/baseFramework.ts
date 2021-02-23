import {
  IConfigurationOptions,
  ILifeCycle,
  IMidwayApplication,
  IMidwayBootstrapOptions,
  IMidwayContainer,
  IMidwayContext,
  IMidwayFramework,
  MidwayFrameworkType,
  MidwayProcessTypeEnum,
} from './interface';
import { MidwayContainer } from './context/midwayContainer';
import {
  APPLICATION_KEY,
  CONFIGURATION_KEY,
  getProviderId,
  listModule,
  LOGGER_KEY,
} from '@midwayjs/decorator';
import {
  ILogger,
  loggers,
  LoggerOptions,
  IMidwayLogger,
  MidwayContextLogger,
} from '@midwayjs/logger';
import { isAbsolute, join, dirname } from 'path';
import { createMidwayLogger } from './logger';
import { safeRequire } from './util';
import { MidwayRequestContainer } from './context/requestContainer';
import { FunctionalConfiguration } from './functional/configuration';

function buildLoadDir(baseDir, dir) {
  if (!isAbsolute(dir)) {
    return join(baseDir, dir);
  }
  return dir;
}

function setupAppDir(baseDir: string) {
  return dirname(baseDir);
}

export abstract class BaseFramework<
  APP extends IMidwayApplication<CTX>,
  CTX extends IMidwayContext,
  OPT extends IConfigurationOptions
> implements IMidwayFramework<APP, OPT> {
  protected isTsMode = true;
  protected baseDir: string;
  protected appDir: string;
  protected applicationContext: IMidwayContainer;
  protected logger: ILogger;
  protected appLogger: ILogger;
  public configurationOptions: OPT;
  public app: APP;
  protected pkg: Record<string, unknown>;
  protected defaultContext = {};
  protected BaseContextLoggerClass: any;

  public configure(options: OPT): BaseFramework<APP, CTX, OPT> {
    this.configurationOptions = options;
    this.BaseContextLoggerClass =
      options.ContextLoggerClass || this.getDefaultContextLoggerClass();
    this.logger = options.logger;
    this.appLogger = options.appLogger;
    return this;
  }

  public async initialize(options: IMidwayBootstrapOptions): Promise<void> {
    this.baseDir = options.baseDir;
    if (!options.appDir) {
      options.appDir = setupAppDir(options.baseDir);
    }
    this.appDir = options.appDir;

    /**
     * before create MidwayContainer instance，can change init parameters
     */
    await this.beforeContainerInitialize(options);

    /**
     * initialize MidwayContainer instance
     */
    await this.containerInitialize(options);

    /**
     * before container load directory and bind
     */
    await this.afterContainerInitialize(options);

    /**
     * run container loadDirectoryLoad method to create object definition
     */
    await this.containerDirectoryLoad(options);

    /**
     * after container load directory and bind
     */
    await this.afterContainerDirectoryLoad(options);

    /**
     * Third party application initialization
     */
    await this.applicationInitialize(options);

    /**
     * start to load configuration and lifeCycle
     */
    await this.containerReady(options);

    /**
     * after container refresh
     */
    await this.afterContainerReady(options);
  }

  protected async initializeInfo(options: IMidwayBootstrapOptions) {
    if (!this.pkg) {
      this.pkg = safeRequire(join(this.appDir, 'package.json'));
    }
  }

  protected async initializeLogger(options: IMidwayBootstrapOptions) {
    if (!this.logger) {
      this.logger = new Proxy(createMidwayLogger(this, 'coreLogger'), {});
      (this.logger as IMidwayLogger).updateDefaultLabel(
        this.getFrameworkName()
      );
    }
    if (!this.appLogger) {
      this.appLogger = createMidwayLogger(this, 'logger', {
        fileLogName: 'midway-app.log',
      }) as IMidwayLogger;
    }
  }

  protected async containerInitialize(options: IMidwayBootstrapOptions) {
    /**
     * initialize container
     */
    this.applicationContext = new MidwayContainer(this.baseDir, undefined);
    this.applicationContext.disableConflictCheck =
      options.disableConflictCheck || true;
    this.applicationContext.registerObject('baseDir', this.baseDir);
    this.applicationContext.registerObject('appDir', this.appDir);
    this.applicationContext.registerObject('isTsMode', this.isTsMode);
    /**
     * initialize base information
     */
    await this.initializeInfo(options);

    /**
     * initialize framework logger
     */
    await this.initializeLogger(options);
  }

  protected async containerDirectoryLoad(options: IMidwayBootstrapOptions) {
    /**
     * load directory and bind files to ioc container
     */
    if (!this.isTsMode && options.disableAutoLoad === undefined) {
      // disable auto load in js mode by default
      options.disableAutoLoad = true;
    }

    if (options.disableAutoLoad) return;

    // use baseDir in parameter first
    const baseDir = options.baseDir || this.baseDir;
    const defaultLoadDir = this.isTsMode ? [baseDir] : [];
    this.applicationContext.load({
      loadDir: (options.loadDir || defaultLoadDir).map(dir => {
        return buildLoadDir(baseDir, dir);
      }),
      pattern: options.pattern,
      ignore: options.ignore,
    });

    if (options.preloadModules && options.preloadModules.length) {
      for (const preloadModule of options.preloadModules) {
        this.applicationContext.bindClass(preloadModule);
      }
    }

    // register app
    this.applicationContext.registerDataHandler(APPLICATION_KEY, () => {
      return this.getApplication();
    });

    // register logger
    this.getApplicationContext().registerDataHandler(LOGGER_KEY, key => {
      return this.getLogger(key);
    });
  }

  protected async containerReady(options: IMidwayBootstrapOptions) {
    if (!this.app.getApplicationContext) {
      this.defineApplicationProperties();
    }

    await this.applicationContext.ready();
    // lifecycle 支持
    await this.loadLifeCycles();
  }

  protected async containerStop() {
    await this.applicationContext.stop();
  }

  public getApplicationContext(): IMidwayContainer {
    return this.applicationContext;
  }

  public getConfiguration(key?: string): any {
    return this.getApplicationContext()
      .getConfigService()
      .getConfiguration(key);
  }

  public getCurrentEnvironment() {
    return this.getApplicationContext()
      .getEnvironmentService()
      .getCurrentEnvironment();
  }

  public abstract applicationInitialize(options: IMidwayBootstrapOptions);

  public abstract getFrameworkType(): MidwayFrameworkType;

  public abstract getApplication(): APP;

  public abstract run(): Promise<void>;

  protected setContextLoggerClass(BaseContextLogger: any) {
    this.BaseContextLoggerClass = BaseContextLogger;
  }

  protected createContextLogger(ctx: CTX, name?: string): ILogger {
    const appLogger = this.getLogger(name);
    return new this.BaseContextLoggerClass(ctx, appLogger);
  }

  public async stop(): Promise<void> {
    await this.beforeStop();
    await this.containerStop();
  }

  public getAppDir(): string {
    return this.appDir;
  }

  public getBaseDir(): string {
    return this.baseDir;
  }

  protected defineApplicationProperties(
    applicationProperties = {},
    whiteList: string[] = []
  ) {
    const defaultApplicationProperties = {
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

      getApplicationContext: () => {
        return this.getApplicationContext();
      },

      getConfig: (key?: string) => {
        return this.getApplicationContext()
          .getConfigService()
          .getConfiguration(key);
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

  public async loadLifeCycles() {
    // agent 不加载生命周期
    if (this.app.getProcessType() === MidwayProcessTypeEnum.AGENT) return;
    const cycles: Array<{ target: any; namespace: string }> = listModule(
      CONFIGURATION_KEY
    );
    for (const cycle of cycles) {
      let inst;
      if (cycle.target instanceof FunctionalConfiguration) {
        // 函数式写法
        inst = cycle.target;
      } else {
        // 普通类写法
        const providerId = getProviderId(cycle.target);
        inst = await this.getApplicationContext().getAsync<ILifeCycle>(
          providerId
        );
      }

      if (typeof inst.onReady === 'function') {
        /**
         * 让组件能正确获取到 bind 之后 registerObject 的对象有三个方法
         * 1、在 load 之后修改 bind，不太可行
         * 2、每次 getAsync 的时候，去掉 namespace，同时还要查找当前全局的变量，性能差
         * 3、一般只会在 onReady 的地方执行 registerObject（否则没有全局的意义），这个取巧的办法就是 onReady 传入一个代理，其中绑定当前的 namespace
         */
        await inst.onReady(
          new Proxy(this.getApplicationContext(), {
            get: function (target, prop, receiver) {
              if (prop === 'getCurrentNamespace' && cycle.namespace) {
                return () => {
                  return cycle.namespace;
                };
              }
              return Reflect.get(target, prop, receiver);
            },
          })
        );
      }
    }
  }

  public getLogger(name?: string) {
    if (name) {
      return loggers.getLogger(name);
    }
    return this.appLogger;
  }

  public getCoreLogger() {
    return this.logger;
  }

  public createLogger(name: string, option: LoggerOptions = {}) {
    return createMidwayLogger(this, name, option);
  }

  public getProjectName() {
    return (this.pkg?.['name'] as string) || '';
  }

  public getFrameworkName() {
    return this.getFrameworkType().toString();
  }

  public getDefaultContextLoggerClass(): any {
    return MidwayContextLogger;
  }
}
