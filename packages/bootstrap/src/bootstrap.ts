import { IMidwayFramework, IMidwayBootstrapOptions } from '@midwayjs/core';
import { join } from 'path';

export function isTypeScriptEnvironment() {
  const TS_MODE_PROCESS_FLAG: string = process.env.MIDWAY_TS_MODE;
  if ('false' === TS_MODE_PROCESS_FLAG) {
    return false;
  }
  // eslint-disable-next-line node/no-deprecated-api
  return TS_MODE_PROCESS_FLAG === 'true' || !!require.extensions['.ts'];
}

export class BootstrapStarter {
  private appDir;
  private bootstrapItems: IMidwayFramework<any, any>[] = [];
  private globalOptions: Partial<IMidwayBootstrapOptions> = {};

  public configure(options: Partial<IMidwayBootstrapOptions>) {
    this.globalOptions = options;
    return this;
  }

  public load(unit: IMidwayFramework<any, any>) {
    this.bootstrapItems.push(unit);
    return this;
  }

  public async init() {
    this.appDir = this.globalOptions.baseDir || process.cwd();
    await Promise.all(
      this.getActions('initialize', {
        ...this.globalOptions,
        baseDir: this.getBaseDir(),
        appDir: this.appDir,
      })
    );
  }

  public async run() {
    await Promise.all(this.getActions('run', {}));
  }

  public async stop() {
    await Promise.all(this.getActions('stop', {}));
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
  static load(unit: IMidwayFramework<any, any>) {
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
    // https://nodejs.org/api/process.html#process_signal_events
    // https://en.wikipedia.org/wiki/Unix_signal
    // kill(2) Ctrl-C
    process.once('SIGINT', this.onSignal.bind(this, 'SIGINT'));
    // kill(3) Ctrl-\
    process.once('SIGQUIT', this.onSignal.bind(this, 'SIGQUIT'));
    // kill(15) default
    process.once('SIGTERM', this.onSignal.bind(this, 'SIGTERM'));

    process.once('exit', this.onExit.bind(this));

    await this.getStarter().init();
    return this.getStarter()
      .run()
      .then(() => {
        console.log('[midway] current app started');
      })
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
  }

  static async stop() {
    return this.getStarter().stop();
  }

  /**
   * on bootstrap receive a exit signal
   * @param signal
   */
  static async onSignal(signal) {
    console.log('[midway] receive signal %s, closing', signal);
    try {
      await this.stop();
      console.log('[midway] close done, exiting with code:0');
      process.exit(0);
    } catch (err) {
      console.error('[midway] close with error: ', err);
      process.exit(1);
    }
  }

  /**
   * on bootstrap process exit
   * @param code
   */
  static onExit(code) {
    console.log('[midway] exit with code:%s', code);
  }
}
