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
    this.configurationOptions = options;
    if (options.typescript === false) {
      this.isTsMode = false;
    }

    this.app = options.app;
    return this;
  }

  protected async beforeInitialize(options: Partial<IMidwayBootstrapOptions>) {
    options.ignore = options.ignore || [];
    options.ignore.push('**/app/extend/**');
  }

  protected async afterDirectoryLoad(
    options: Partial<IMidwayBootstrapOptions>
  ) {
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
  }

  protected async afterInitialize(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {
    // register plugin
    this.containerLoader.registerHook(PLUGIN_KEY, (key, target) => {
      return this.app[key];
    });

    // register config
    this.containerLoader.registerHook(CONFIG_KEY, key => {
      return key ? safelyGet(key, this.app.config) : this.app.config;
    });

    // register logger
    this.containerLoader.registerHook(LOGGER_KEY, key => {
      if (this.app.getLogger) {
        return this.app.getLogger(key);
      }
      return this.app.coreLogger;
    });
  }

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
