import {
  IMidwayBootstrapOptions,
  MidwayFrameworkType,
  MidwayProcessTypeEnum,
} from '@midwayjs/core';
import { ControllerOption } from '@midwayjs/decorator';
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
}
