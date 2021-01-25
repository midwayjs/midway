import { IMidwayFramework, IMidwayBootstrapOptions } from '@midwayjs/core';
import { join } from 'path';
import { createConsoleLogger, ILogger, IMidwayLogger } from '@midwayjs/logger';

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

  public configure(options: IMidwayBootstrapOptions) {
    this.globalOptions = options;
    return this;
  }

  public load(unit: IMidwayFramework<any, any>) {
    this.bootstrapItems.push(unit);
    return this;
  }

  public async init() {
    this.appDir = this.globalOptions.appDir || process.cwd();
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
    if (global['MIDWAY_BOOTSTRAP_APP_SET']) {
      // for test/dev
      this.bootstrapItems.forEach(item => {
        global['MIDWAY_BOOTSTRAP_APP_SET'].add({
          framework: item,
          starter: this,
        });
      });
      global['MIDWAY_BOOTSTRAP_APP_READY'] = true;
    }
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
    if (this.globalOptions.baseDir) {
      return this.globalOptions.baseDir;
    }
    if (isTypeScriptEnvironment()) {
      return join(this.appDir, 'src');
    } else {
      return join(this.appDir, 'dist');
    }
  }
}

export class Bootstrap {
  static starter: BootstrapStarter;
  static logger: ILogger;
  static configured = false;

  /**
   * set global configuration for midway
   * @param configuration
   */
  static configure(configuration: IMidwayBootstrapOptions = {}) {
    this.configured = true;
    if (!this.logger && !configuration.logger) {
      this.logger = createConsoleLogger('bootstrapConsole');
      if (configuration.logger === false) {
        (this.logger as IMidwayLogger)?.disableConsole();
      }
      configuration.logger = this.logger;
    } else {
      this.logger = this.logger || configuration.logger as ILogger;
    }
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
    if (!this.configured) {
      this.configure();
    }
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
        this.logger.info('[midway:bootstrap] current app started');
      })
      .catch(err => {
        this.logger.error(err);
        process.exit(1);
      });
  }

  static async stop() {
    await this.getStarter().stop();
  }

  static reset() {
    this.logger = null;
    this.configured = false;
    this.starter = null;
  }

  /**
   * on bootstrap receive a exit signal
   * @param signal
   */
  static async onSignal(signal) {
    this.logger.info('[midway:bootstrap] receive signal %s, closing', signal);
    try {
      await this.stop();
      this.logger.info('[midway:bootstrap] close done, exiting with code:0');
      process.exit(0);
    } catch (err) {
      this.logger.error('[midway:bootstrap] close with error: ', err);
      process.exit(1);
    }
  }

  /**
   * on bootstrap process exit
   * @param code
   */
  static onExit(code) {
    this.logger.info('[midway:bootstrap] exit with code:%s', code);
  }
}
