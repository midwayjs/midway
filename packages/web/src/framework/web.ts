import {
  IMidwayBootstrapOptions,
  MidwayFrameworkType,
  MidwayProcessTypeEnum,
  safelyGet,
} from '@midwayjs/core';
import { CONFIG_KEY, PLUGIN_KEY, LOGGER_KEY } from '@midwayjs/decorator';
import { IMidwayWebConfigurationOptions } from '../interface';
import { MidwayKoaBaseFramework } from '@midwayjs/koa';
import { EggRouter } from '@eggjs/router';
import { Application, Context, Router, EggLogger } from 'egg';
import { loggers } from '@midwayjs/logger';

export class MidwayWebFramework extends MidwayKoaBaseFramework<
  Application,
  Context,
  IMidwayWebConfigurationOptions
> {
  public app: Application;
  public configurationOptions: IMidwayWebConfigurationOptions;
  public prioritySortRouters: Array<{
    priority: number;
    router: Router;
  }> = [];
  protected loggers: {
    [name: string]: EggLogger;
  };

  public configure(
    options: IMidwayWebConfigurationOptions
  ): MidwayWebFramework {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    this.configurationOptions = options;
    // set default context logger
    this.BaseContextLoggerClass =
      options.ContextLoggerClass || this.getDefaultContextLoggerClass();

    if (options.typescript === false) {
      this.isTsMode = false;
    }

    this.app = options.app;

    this.defineApplicationProperties(
      {
        generateController: (controllerMapping: string) => {
          return this.generateController(controllerMapping);
        },

        generateMiddleware: async (middlewareId: any) => {
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
      },
      ['createAnonymousContext']
    );

    if (this.app.config.midwayFeature['replaceEggLogger']) {
      // if use midway logger will be use midway custom context logger
      this.app.beforeStart(() => {
        this.app.ContextLogger = self.BaseContextLoggerClass;
      });
    }

    Object.defineProperty(this.app, 'applicationContext', {
      get() {
        return self.getApplicationContext();
      },
    });

    return this;
  }

  public async initialize(options: IMidwayBootstrapOptions): Promise<void> {
    this.isMainFramework = options.isMainFramework;
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
    // 不需要在这里创建框架日志，从 egg 代理过来
    this.logger = this.app.coreLogger;
    this.appLogger = this.app.logger;
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
      return this.getLogger(key);
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

  public getLogger(name?: string) {
    if (name) {
      return this.app.loggers[name] || loggers.getLogger(name);
    }
    return this.appLogger;
  }

  /**
   * 这个方法 egg-cluster 不走，只有单进程模式使用 @midwayjs/bootstrap 才会执行
   */
  public async run(): Promise<void> {}

  /**
   * 这个方法 egg-cluster 不走，只有单进程模式使用 @midwayjs/bootstrap 才会执行
   */
  protected async beforeStop(): Promise<void> {}

  protected createRouter(routerOptions): Router {
    const router = new EggRouter(routerOptions, this.app);
    router.prefix(routerOptions.prefix);
    this.prioritySortRouters.push({
      priority: 0,
      router,
    });
    return router;
  }

  protected setContextLoggerClass(BaseContextLogger: any) {
    this.BaseContextLoggerClass = BaseContextLogger;
    this.app.ContextLogger = BaseContextLogger;
  }
}
