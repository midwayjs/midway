import {
  IMidwayFramework,
  IMidwayBootstrapOptions,
  MidwayFrameworkType,
  ConfigFramework,
  IMidwayApplication,
  IMidwayContainer,
} from '@midwayjs/core';
import { join } from 'path';
import { createConsoleLogger, ILogger } from '@midwayjs/logger';

export function isTypeScriptEnvironment() {
  const TS_MODE_PROCESS_FLAG: string = process.env.MIDWAY_TS_MODE;
  if ('false' === TS_MODE_PROCESS_FLAG) {
    return false;
  }
  // eslint-disable-next-line node/no-deprecated-api
  return TS_MODE_PROCESS_FLAG === 'true' || !!require.extensions['.ts'];
}

export class BootstrapStarter {
  protected appDir: string;
  protected baseDir: string;
  protected bootstrapItems: IMidwayFramework<any, any>[] = [];
  protected globalOptions: Partial<IMidwayBootstrapOptions> = {};
  protected globalAppMap = new Map<
    MidwayFrameworkType,
    IMidwayApplication<any>
  >();
  protected globalConfig: any;

  public configure(options: IMidwayBootstrapOptions) {
    this.globalOptions = options;
    return this;
  }

  public load(unit: (globalConfig: unknown) => IMidwayFramework<any, any>);
  public load(unit: IMidwayFramework<any, any>);
  public load(unit: any) {
    this.bootstrapItems.push(unit);
    return this;
  }

  public async init() {
    this.appDir = this.globalOptions.appDir || process.cwd();
    this.baseDir = this.getBaseDir();
    let mainApp; // eslint-disable-line prefer-const

    // 初始化一个只读配置的空框架，并且初始化容器和扫描
    const framework = new ConfigFramework();
    await framework.initialize({
      baseDir: this.baseDir,
      appDir: this.appDir,
      globalApplicationHandler: (type: MidwayFrameworkType) => {
        if (type) {
          return this.globalAppMap.get(type);
        } else {
          return mainApp;
        }
      },
    });

    // 调用 bootstrap 的 before 逻辑
    if (this.globalOptions['beforeHandler']) {
      await this.globalOptions['beforeHandler'](
        framework.getApplicationContext()
      );
    }

    // 获取全局配置
    this.globalConfig =
      framework.getApplicationContext().getConfigService().getConfiguration() ||
      {};
    this.refreshBootstrapItems();

    const applicationContext = framework.getApplicationContext();

    // 初始化主框架
    await this.getFirstActions('initialize', {
      ...this.globalOptions,
      baseDir: this.baseDir,
      appDir: this.appDir,
      isMainFramework: true,
      applicationContext,
    });

    global['MIDWAY_MAIN_FRAMEWORK'] = this.getMainFramework();
    mainApp = await this.getFirstActions('getApplication');

    // 初始化其余的副框架
    await Promise.all(
      this.getTailActions('initialize', {
        ...this.globalOptions,
        baseDir: this.baseDir,
        appDir: this.appDir,
        applicationContext,
        isMainFramework: false,
      })
    );

    this.bootstrapItems.forEach(item => {
      this.globalAppMap.set(item.getFrameworkType(), item.getApplication());
      if (global['MIDWAY_BOOTSTRAP_APP_SET']) {
        // for test/dev
        global['MIDWAY_BOOTSTRAP_APP_SET'].add({
          framework: item,
          starter: this,
        });
      }
    });

    // 等所有框架初始化完之后，开始执行生命周期
    await this.getFirstActions('loadExtension');
    await this.getActions('afterContainerReady');
  }

  public async run() {
    await Promise.all(this.getActions('run', {}));
    global['MIDWAY_BOOTSTRAP_APP_READY'] = true;
  }

  public async stop() {
    await Promise.all(this.getActions('stop', {}));
    global['MIDWAY_BOOTSTRAP_APP_READY'] = false;
  }

  public getActions(action: string, args?): any[] {
    return this.bootstrapItems.map(item => {
      if (item[action]) {
        return item[action](args);
      }
    });
  }

  public async getFirstActions(action: string, args?) {
    if (this.bootstrapItems.length && this.bootstrapItems[0][action]) {
      return this.bootstrapItems[0][action](args);
    }
  }

  public getTailActions(action: string, args?): any[] {
    if (this.bootstrapItems.length > 1) {
      return this.bootstrapItems.slice(1).map(item => {
        if (item[action]) {
          return item[action](args);
        }
      });
    }
    return [];
  }

  protected getMainFramework() {
    return this.bootstrapItems[0];
  }

  protected refreshBootstrapItems() {
    this.bootstrapItems = this.bootstrapItems.map(bootstrapItem => {
      if (typeof bootstrapItem === 'function') {
        return (bootstrapItem as any)(this.globalConfig);
      }
      return bootstrapItem;
    });
  }

  protected getBaseDir() {
    if (this.globalOptions.baseDir) {
      return this.globalOptions.baseDir;
    }
    if (isTypeScriptEnvironment()) {
      return join(this.appDir, 'src');
    } else {
      return join(this.appDir, 'dist');
    }
  }

  public getBootstrapAppMap() {
    return this.globalAppMap;
  }
}

export class Bootstrap {
  static starter: BootstrapStarter;
  static logger: ILogger;
  static configured = false;
  static beforeHandler;

  /**
   * set global configuration for midway
   * @param configuration
   */
  static configure(configuration: IMidwayBootstrapOptions = {}) {
    this.configured = true;
    if (!this.logger && !configuration.logger) {
      this.logger = createConsoleLogger('bootstrapConsole');
      if (configuration.logger === false) {
        this.logger?.['disableConsole']();
      }
      configuration.logger = this.logger;
    } else {
      this.logger = this.logger || (configuration.logger as ILogger);
    }

    // 处理三方框架内部依赖 process.cwd 来查找 node_modules 等问题
    if (configuration.appDir && configuration.appDir !== process.cwd()) {
      process.chdir(configuration.appDir);
    }

    configuration['beforeHandler'] = this.beforeHandler;
    this.getStarter().configure(configuration);
    return this;
  }

  /**
   * load midway framework unit
   * @param unit
   */
  static load(unit: (globalConfig: unknown) => IMidwayFramework<any, any>);
  static load(unit: IMidwayFramework<any, any>);
  static load(unit: any) {
    this.getStarter().load(unit);
    return this;
  }

  private static getStarter() {
    if (!this.starter) {
      this.starter = new BootstrapStarter();
    }
    return this.starter;
  }

  static before(beforeHandler: (container: IMidwayContainer) => void) {
    this.beforeHandler = beforeHandler;
    return this;
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

    this.uncaughtExceptionHandler = this.uncaughtExceptionHandler.bind(this);
    process.on('uncaughtException', this.uncaughtExceptionHandler);

    this.unhandledRejectionHandler = this.unhandledRejectionHandler.bind(this);
    process.on('unhandledRejection', this.unhandledRejectionHandler);

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
    process.removeListener('uncaughtException', this.uncaughtExceptionHandler);
    process.removeListener(
      'unhandledRejection',
      this.unhandledRejectionHandler
    );
    this.reset();
  }

  static reset() {
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

  static uncaughtExceptionHandler(err) {
    if (!(err instanceof Error)) {
      err = new Error(String(err));
    }
    if (err.name === 'Error') {
      err.name = 'unhandledExceptionError';
    }
    this.logger.error(err);
  }

  static unhandledRejectionHandler(err) {
    if (!(err instanceof Error)) {
      const newError = new Error(String(err));
      // err maybe an object, try to copy the name, message and stack to the new error instance
      if (err) {
        if (err.name) newError.name = err.name;
        if (err.message) newError.message = err.message;
        if (err.stack) newError.stack = err.stack;
      }
      err = newError;
    }
    if (err.name === 'Error') {
      err.name = 'unhandledRejectionError';
    }
    this.logger.error(err);
  }
}
