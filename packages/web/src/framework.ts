import { IMidwayBootstrapOptions, MidwayFrameworkType, MidwayProcessTypeEnum, safelyGet } from '@midwayjs/core';
import { CONFIG_KEY, ControllerOption, LOGGER_KEY, PLUGIN_KEY, } from '@midwayjs/decorator';
import { IMidwayWebApplication, IMidwayWebConfigurationOptions, IMidwayWebContext, } from './interface';
import { MidwayKoaBaseFramework } from '@midwayjs/koa';
import { EggRouter } from '@eggjs/router';
import { resolve } from 'path';
import { Router } from 'egg';

export class MidwayWebFramework extends MidwayKoaBaseFramework<IMidwayWebConfigurationOptions, IMidwayWebApplication, IMidwayWebContext> {
  protected app: IMidwayWebApplication;
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

  protected async beforeInitialize(
    options: Partial<IMidwayBootstrapOptions>
  ) {
    options.ignore = options.ignore || [];
    options.ignore.push('**/app/extend/**');
  }

  protected async afterDirectoryLoad(options: Partial<IMidwayBootstrapOptions>) {
    if (this.isTsMode) {
      process.env.EGG_TYPESCRIPT = 'true';
    }

    if (!this.app) {
      const { start } = require('egg');
      this.app = await start({
        baseDir: options.appDir,
        sourceDir: this.isTsMode ? options.baseDir : options.appDir,
        ignoreWarning: true,
        framework: resolve(__dirname, 'application'),
        plugins: this.configurationOptions.plugins,
        webFramework: this,
        mode: 'single',
      });
    }

    this.defineApplicationProperties(this.app);
    // register plugin
    this.containerLoader.registerHook(
      PLUGIN_KEY,
      (key: string, target: any) => {
        return this.app[key];
      }
    );

    // register config
    this.containerLoader.registerHook(CONFIG_KEY, (key: string) => {
      return key ? safelyGet(key, this.app.config) : this.app.config;
    });

    // register logger
    this.containerLoader.registerHook(LOGGER_KEY, (key: string) => {
      if (this.app.getLogger) {
        return this.app.getLogger(key);
      }
      return this.app.coreLogger;
    });
  }

  protected async afterInitialize(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {
    if (this.configurationOptions.processType !== 'agent') {
      await this.loadMidwayController();
    }
  }

  public getApplication(): IMidwayWebApplication {
    return this.app;
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.WEB;
  }

  public async run(): Promise<void> {
    if (this.configurationOptions.port) {
      new Promise((resolve) => {
        this.app.listen(this.configurationOptions.port, () => {
          resolve();
        });
      });
    }
  }

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

  protected defineApplicationProperties(app): IMidwayWebApplication {
    return Object.assign(app, {
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

      getConfig: (key?: string) => {
        return this.getApplicationContext()
          .getConfigService()
          .getConfiguration(key);
      },

      getFrameworkType: () => {
        return this.getFrameworkType();
      },

      getProcessType: () => {
        // TODO 区分进程类型
        return MidwayProcessTypeEnum.APPLICATION;
      }
    });
  }

}
