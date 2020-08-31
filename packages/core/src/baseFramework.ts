import {
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayBootstrapOptions,
  IMidwayContainer,
  IMidwayFramework,
} from './interface';
import { ContainerLoader } from './';

export abstract class BaseFramework<T extends IConfigurationOptions>
  implements IMidwayFramework {
  protected baseDir: string;
  protected appDir: string;
  protected configurationOptions: T;
  protected containerLoader: ContainerLoader;

  public configure(options: T): IMidwayFramework {
    this.configurationOptions = options;
    return this;
  }

  public async initialize(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {
    this.baseDir = options.baseDir;
    this.appDir = options.appDir;

    await this.beforeInitialize(options);

    this.containerLoader = new ContainerLoader({
      baseDir: this.baseDir,
      isTsMode: true,
      preloadModules: options.preloadModules || [],
    });
    this.containerLoader.initialize();

    const applicationContext = this.containerLoader.getApplicationContext();
    applicationContext.registerObject('baseDir', this.baseDir);
    applicationContext.registerObject('appDir', this.appDir);
    // 如果没有关闭autoLoad 则进行load
    this.containerLoader.loadDirectory(options);
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

  public abstract getApplication(): IMidwayApplication;

  public abstract run(): Promise<void>;

  public abstract stop(): Promise<void>;

  protected async beforeInitialize(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {}

  protected abstract async afterInitialize(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void>;
}
