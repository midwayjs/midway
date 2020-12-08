import {
  IMidwayBootstrapOptions,
  IMidwayContainer,
  IMidwayFramework,
  MidwayFrameworkType,
} from '@midwayjs/core';
import { IMidwayWebConfigurationOptions } from './interface';
import { Application } from 'egg';
import { resolve } from 'path';

export class MidwayDevFramework
  implements IMidwayFramework<Application, IMidwayWebConfigurationOptions> {
  public app: Application;
  public configurationOptions: IMidwayWebConfigurationOptions;
  isTsMode: boolean;

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

  configure(options: IMidwayWebConfigurationOptions): MidwayDevFramework {
    this.configurationOptions = options;
    return this;
  }

  getApplicationContext(): IMidwayContainer {
    return this.app.getApplicationContext();
  }

  getConfiguration(key?: string): any {
    return this.app.getConfig(key);
  }

  getCurrentEnvironment(): string {
    return this.app.getEnv();
  }

  async initialize(options: Partial<IMidwayBootstrapOptions>) {
    const { start } = require('egg');
    this.app = await start({
      baseDir: options.appDir,
      ignoreWarning: true,
      framework: resolve(__dirname, 'application'),
      plugins: this.configurationOptions.plugins,
      mode: 'single',
      isTsMode: this.isTsMode || true,
    });
  }

  async stop(): Promise<void> {
    await this.app.close();
  }

  getBaseDir(): string {
    return this.app.getBaseDir();
  }

  getAppDir(): string {
    return this.app.getAppDir();
  }

  getLogger() {
    return this.app.coreLogger as any;
  }
}
