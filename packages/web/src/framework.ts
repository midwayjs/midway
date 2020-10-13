import {
  IMidwayBootstrapOptions,
  MidwayFrameworkType,
  MidwayProcessTypeEnum,
} from '@midwayjs/core';
import { ControllerOption } from '@midwayjs/decorator';
import { IMidwayWebConfigurationOptions } from './interface';
import { MidwayKoaBaseFramework } from '@midwayjs/koa';
import { EggRouter } from '@eggjs/router';
import { resolve } from 'path';
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
  public isClusterMode = false;

  public configure(
    options: IMidwayWebConfigurationOptions
  ): MidwayWebFramework {
    this.configurationOptions = options;
    if (options.typescript === false) {
      this.isTsMode = false;
    }

    this.app = options.app;
    this.isClusterMode = !!this.app;
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

    if (!this.app) {
      const { start } = require('egg');
      this.app = await start({
        baseDir: options.appDir,
        ignoreWarning: true,
        framework: resolve(__dirname, 'application'),
        plugins: this.configurationOptions.plugins,
        webFramework: this,
        isClusterMode: this.isClusterMode,
        mode: 'single',
        isTsMode: this.isTsMode,
      });

      this.configurationOptions.globalConfig = this.app.config;
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
      // this.app.config = this.getConfiguration();
    }

    this.defineApplicationProperties(this.app);
  }

  protected async afterInitialize(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {
    if (this.configurationOptions.processType !== 'agent') {
      await this.loadMidwayController();
    }
  }

  public getApplication(): Application {
    return this.app;
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.WEB;
  }

  public async run(): Promise<void> {
    if (this.configurationOptions.port) {
      new Promise(resolve => {
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

  protected defineApplicationProperties(app): Application {
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
}
