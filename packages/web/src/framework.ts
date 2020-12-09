import {
  IMidwayBootstrapOptions,
  MidwayFrameworkType,
  MidwayProcessTypeEnum,
  safelyGet,
} from '@midwayjs/core';
import {
  ControllerOption,
  CONFIG_KEY,
  LOGGER_KEY,
  PLUGIN_KEY,
} from '@midwayjs/decorator';
import { IMidwayWebConfigurationOptions } from './interface';
import { MidwayKoaBaseFramework } from '@midwayjs/koa';
import { EggRouter } from '@eggjs/router';
import { Application, Context, Router } from 'egg';
import { MidwayDelegateLogger } from '@midwayjs/logger';

export class MidwayWebFramework extends MidwayKoaBaseFramework<
  IMidwayWebConfigurationOptions,
  Application,
  Context
> {
  public app: Application;
  public configurationOptions: IMidwayWebConfigurationOptions;
  public prioritySortRouters: Array<{
    priority: number;
    router: Router;
  }> = [];

  public configure(
    options: IMidwayWebConfigurationOptions
  ): MidwayWebFramework {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    this.configurationOptions = options;
    if (options.typescript === false) {
      this.isTsMode = false;
    }

    this.app = options.app;

    this.defineApplicationProperties({
      generateController: (controllerMapping: string) => {
        return this.generateController(controllerMapping);
      },

      generateMiddleware: async (middlewareId: string) => {
        return this.generateMiddleware(middlewareId);
      },

      getProcessType: () => {
        if (this.configurationOptions.processType === 'application') {
          return MidwayProcessTypeEnum.APPLICATION;
        }
        if (this.configurationOptions.processType === 'agent') {
          return MidwayProcessTypeEnum.AGENT;
        }

        // TODO 单进程模式下区分进程类型??
        return MidwayProcessTypeEnum.APPLICATION;
      },
    });

    Object.defineProperty(this.app, 'applicationContext', {
      get() {
        return self.getApplicationContext();
      },
    });

    return this;
  }

  public async initialize(options: IMidwayBootstrapOptions): Promise<void> {
    this.baseDir = options.baseDir;
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
     * EggJS 比较特殊，生命周期触发需要等到插件加载完才能加载
     */
    await this.applicationContext.ready();

    /**
     * after container refresh
     */
    await this.afterContainerReady(options);
  }

  protected async beforeContainerInitialize(
    options: Partial<IMidwayBootstrapOptions>
  ) {
    options.ignore = options.ignore || [];
    options.ignore.push('**/app/extend/**');
  }

  protected async initializeLogger() {
    if (!this.logger) {
      this.logger = new MidwayDelegateLogger({
        delegateLogger: this.app.coreLogger,
      });
      this.getApplicationContext()
        .getLoggerService()
        .addLogger('default', this.logger);
    }
  }

  async applicationInitialize(options: Partial<IMidwayBootstrapOptions>) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    if (this.isTsMode) {
      process.env.EGG_TYPESCRIPT = 'true';
    }
    if (this.configurationOptions.globalConfig) {
      this.getApplicationContext()
        .getConfigService()
        .addObject(this.configurationOptions.globalConfig);
      Object.defineProperty(this.app, 'config', {
        get() {
          return self.getConfiguration();
        },
      });
    }

    // register plugin
    this.getApplicationContext().registerDataHandler(
      PLUGIN_KEY,
      (key, target) => {
        return this.app[key];
      }
    );

    // register config
    this.getApplicationContext().registerDataHandler(CONFIG_KEY, key => {
      return key ? safelyGet(key, this.app.config) : this.app.config;
    });

    // register logger
    this.getApplicationContext().registerDataHandler(LOGGER_KEY, key => {
      if (this.app.getLogger) {
        return this.app.getLogger(key);
      }
      return this.app.coreLogger;
    });
  }

  protected async afterContainerReady(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {}

  public getApplication(): Application {
    return this.app;
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.WEB;
  }

  /**
   * 这个方法 egg-cluster 不走，只有单进程模式使用 @midwayjs/bootstrap 才会执行
   */
  public async run(): Promise<void> {}

  /**
   * 这个方法 egg-cluster 不走，只有单进程模式使用 @midwayjs/bootstrap 才会执行
   */
  protected async beforeStop(): Promise<void> {
    await this.app.close();
  }

  /**
   * @param controllerOption
   */
  protected createRouter(controllerOption: ControllerOption): Router {
    const {
      prefix,
      routerOptions: { sensitive },
    } = controllerOption;
    if (prefix) {
      const router = new EggRouter({ sensitive }, this.app);
      router.prefix(prefix);
      return router;
    }
    return null;
  }
}
