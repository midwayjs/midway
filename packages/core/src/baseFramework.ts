import {
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayBootstrapOptions,
  IMidwayContainer,
  IMidwayFramework,
  MidwayFrameworkType,
} from './interface';
import { ContainerLoader } from './';
import { APPLICATION_KEY, CONFIG_KEY } from '@midwayjs/decorator';

export abstract class BaseFramework<T extends IConfigurationOptions>
  implements IMidwayFramework<T> {
  protected isTsMode = true;
  protected baseDir: string;
  protected appDir: string;
  protected containerLoader: ContainerLoader;
  public configurationOptions: T;

  public configure(options: T): BaseFramework<T> {
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
    // 如果没有关闭autoLoad 则进行load
    this.containerLoader.loadDirectory(options);

    // register config
    this.containerLoader.registerHook(CONFIG_KEY, (key: string) => {
      return this.getConfiguration(key);
    });

    // register app
    this.containerLoader.registerHook(APPLICATION_KEY, () => {
      return this.getApplication();
    });

    await this.afterDirectoryLoad(options);

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

  public abstract getApplication(): IMidwayApplication;

  public abstract run(): Promise<void>;

  public async stop(): Promise<void> {
    await this.beforeStop();
    await this.containerLoader.stop();
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
