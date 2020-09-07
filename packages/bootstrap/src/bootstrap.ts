import { IMidwayFramework, IMidwayBootstrapOptions } from '@midwayjs/core';
import { join } from 'path';

function isTypeScriptEnvironment() {
  const TS_MODE_PROCESS_FLAG: string = process.env.MIDWAY_TS_MODE;
  if ('false' === TS_MODE_PROCESS_FLAG) {
    return false;
  }
  // eslint-disable-next-line node/no-deprecated-api
  return TS_MODE_PROCESS_FLAG === 'true' || !!require.extensions['.ts'];
}

export class BootstrapStarter {
  private appDir;
  private bootstrapItems: IMidwayFramework<any>[] = [];
  private globalOptions: Partial<IMidwayBootstrapOptions>;

  public configure(options: Partial<IMidwayBootstrapOptions>) {
    this.globalOptions = options;
    return this;
  }

  public load(unit: IMidwayFramework<any>) {
    this.bootstrapItems.push(unit);
    return this;
  }

  public async init() {
    this.appDir =  this.globalOptions.baseDir;
    await Promise.all(
      this.getActions('initialize', {
        ...this.globalOptions,
        baseDir: this.getBaseDir(),
        appDir: this.appDir,
      })
    );
  }

  public async run() {
    await Promise.all(
      this.getActions('run', {})
    );
  }

  public async stop() {
    await Promise.all(
      this.getActions('stop', {})
    );
  }

  public getActions(action: string, args?): any[] {
    return this.bootstrapItems.map(item => {
      return item[action](args);
    });
  }

  private getBaseDir() {
    if (isTypeScriptEnvironment()) {
      return join(this.appDir, 'src');
    } else {
      return join(this.appDir, 'dist');
    }
  }
}

export class Bootstrap {
  static starter: BootstrapStarter;

  /**
   * set global configuration for midway
   * @param configuration
   */
  static configure(configuration: Partial<IMidwayBootstrapOptions>) {
    this.getStarter().configure(configuration);
    return this;
  }

  /**
   * load midway framework unit
   * @param unit
   */
  static load(unit: IMidwayFramework<any>) {
    this.getStarter().load(unit);
    return this;
  }

  private static getStarter() {
    if (!this.starter) {
      this.starter = new BootstrapStarter();
    }
    return this.starter;
  }

  static async run() {
    await this.getStarter().init();
    return this.getStarter().run().catch(
      console.error
    );
  }

  static async stop() {
    return this.getStarter().stop().catch(
      console.error
    );
  }
}
