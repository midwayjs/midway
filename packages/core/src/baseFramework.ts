import {
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayBootstrapOptions,
  IMidwayContainer,
  IMidwayFramework,
  MidwayFrameworkType,
  MidwayProcessTypeEnum,
} from './interface';
import { ContainerLoader } from './';
import { APPLICATION_KEY } from '@midwayjs/decorator';

export abstract class BaseFramework<
  APP extends IMidwayApplication,
  T extends IConfigurationOptions
> implements IMidwayFramework<APP, T> {
  protected isTsMode = true;
  protected baseDir: string;
  protected appDir: string;
  protected containerLoader: ContainerLoader;
  public configurationOptions: T;
  public app: APP;

  public configure(options: T): BaseFramework<APP, T> {
    this.configurationOptions = options;
    return this;
  }

  public async initialize(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {
    this.baseDir = options.baseDir;
    this.appDir = options.appDir;

    this.containerLoader = new ContainerLoader({
      baseDir: this.baseDir,
      isTsMode: this.isTsMode,
      preloadModules: options.preloadModules || [],
    });

    /**
     * initialize containerLoader and initialize ioc container instance
     */
    await this.beforeInitialize(options);
    this.containerLoader.initialize();

    /**
     * load directory and bind files to ioc container
     */
    await this.beforeDirectoryLoad(options);
    const applicationContext = this.containerLoader.getApplicationContext();
    applicationContext.registerObject('baseDir', this.baseDir);
    applicationContext.registerObject('appDir', this.appDir);
    this.containerLoader.loadDirectory(options);

    // register app
    this.containerLoader.registerHook(APPLICATION_KEY, () => {
      return this.getApplication();
    });

    await this.afterDirectoryLoad(options);

    if (!this.app.getApplicationContext) {
      this.defineApplicationProperties();
    }

    /**
     * start to load configuration and lifeCycle
     */
    await this.containerLoader.refresh();
    await this.afterInitialize(options);
  }

  public getApplicationContext(): IMidwayContainer {
    return this.containerLoader.getApplicationContext();
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

  public abstract getFrameworkType(): MidwayFrameworkType;

  public abstract getApplication(): APP;

  public abstract run(): Promise<void>;

  public async stop(): Promise<void> {
    await this.beforeStop();
    await this.containerLoader.stop();
  }

  protected defineApplicationProperties(applicationProperties: object = {}) {
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
    };
    Object.assign(
      this.app,
      defaultApplicationProperties,
      applicationProperties
    );
  }

  protected async beforeStop(): Promise<void> {}

  protected async beforeInitialize(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {}

  protected async beforeDirectoryLoad(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {}

  protected async afterDirectoryLoad(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {}

  protected abstract async afterInitialize(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void>;
}
