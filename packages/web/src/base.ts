import { findLernaRoot, parseNormalDir } from './utils';
import * as extend from 'extend2';
import { EggAppInfo } from 'egg';
import { MidwayWebFramework } from './framework/web';
import { safelyGet, safeRequire } from '@midwayjs/core';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { createLoggers } from './logger';
import { EggRouter as Router } from '@eggjs/router';
import { WebBootstrapStarter } from './starter';

const ROUTER = Symbol('EggCore#router');
const EGG_LOADER = Symbol.for('egg#loader');
const EGG_PATH = Symbol.for('egg#eggPath');
const LOGGERS = Symbol('EggApplication#loggers');

let customFramework = null;
function getFramework() {
  if (customFramework) return customFramework;
  /**
   * create real egg loader and application object
   */
  const pkg = safeRequire(
    join(process.env.MIDWAY_PROJECT_APPDIR || process.cwd(), 'package.json'),
    false
  );
  customFramework = safelyGet('egg.framework', pkg);
  if (customFramework) {
    return customFramework;
  } else {
    return 'egg';
  }
}

export const createAppWorkerLoader = () => {
  const AppWorkerLoader =
    require(getFramework())?.AppWorkerLoader || require('egg').AppWorkerLoader;
  class EggAppWorkerLoader extends (AppWorkerLoader as any) {
    app: any;
    framework;
    bootstrap;
    useEggSocketIO = false;

    getEggPaths() {
      if (!this.appDir) {
        // 这里的逻辑是为了兼容老 cluster 模式
        if (this.app.options.typescript || this.app.options.isTsMode) {
          process.env.EGG_TYPESCRIPT = 'true';
        }
        const result = parseNormalDir(
          this.app.options['baseDir'],
          this.app.options.isTsMode
        );
        this.baseDir = result.baseDir;
        this.options.baseDir = this.baseDir;
        this.appDir = this.app.appDir = result.appDir;
      }

      const result = super.getEggPaths();
      const monorepoRoot = findLernaRoot();
      if (monorepoRoot) {
        result.push(monorepoRoot);
      }

      if (process.env.MIDWAY_EGG_PLUGIN_PATH) {
        result.push(process.env.MIDWAY_EGG_PLUGIN_PATH);
      }

      if (process.cwd() !== this.appDir) {
        result.push(this.appDir);
      }

      const pathSet = new Set(result);
      return Array.from(pathSet);
    }

    protected getAppInfo(): EggAppInfo {
      if (!this.appInfo) {
        const appInfo: EggAppInfo | undefined = super.getAppInfo();
        // ROOT == HOME in prod env
        this.appInfo = extend(true, appInfo, {
          root:
            appInfo.env === 'local' || appInfo.env === 'unittest'
              ? this.appDir
              : appInfo.root,
          appDir: this.appDir,
        });
      }
      return this.appInfo;
    }

    protected getServerEnv() {
      // 这里和 egg 不同的是，一是修改了根路径，二是增加了环境变量
      let serverEnv = this.options.env;

      let envPath = join(this.appDir, 'config/env');
      if (!serverEnv && existsSync(envPath)) {
        serverEnv = readFileSync(envPath, 'utf8').trim();
      }

      envPath = join(this.appDir, 'config/serverEnv');
      if (!serverEnv && existsSync(envPath)) {
        serverEnv = readFileSync(envPath, 'utf8').trim();
      }

      if (!serverEnv) {
        serverEnv = process.env.MIDWAY_SERVER_ENV || process.env.EGG_SERVER_ENV;
      }

      if (!serverEnv) {
        serverEnv = super.getServerEnv();
      } else {
        serverEnv = serverEnv.trim();
      }

      if (serverEnv && !process.env.MIDWAY_SERVER_ENV) {
        process.env.MIDWAY_SERVER_ENV = serverEnv;
      }

      return serverEnv;
    }

    load() {
      this.framework = new MidwayWebFramework().configure({
        processType: 'application',
        app: this.app,
        globalConfig: this.app.config,
      });

      this.bootstrap = new WebBootstrapStarter({
        isWorker: true,
        applicationContext: this.app.options.applicationContext,
      });
      this.bootstrap
        .configure({
          appDir: this.app.appDir,
        })
        .load(this.framework);
      if (this.app.options['midwaySingleton'] !== true) {
        if (!global['MIDWAY_MAIN_FRAMEWORK']) {
          global['MIDWAY_MAIN_FRAMEWORK'] = this.framework;
        }
        // 这个代码只会在 egg-cluster 模式下执行
        this.app.beforeStart(async () => {
          await this.bootstrap.init();
          super.load();
        });
      }
    }

    /**
     * 这个代码只会在单进程 bootstrap.js 模式下执行
     */
    async loadOrigin() {
      await this.bootstrap.init();
      super.load();
    }

    loadMiddleware() {
      super.loadMiddleware();
      if (this.plugins['io']) {
        this.useEggSocketIO = true;
        const sessionMiddleware = this.app.middlewares['session'](
          this.app.config['session'],
          this.app
        );
        sessionMiddleware._name = 'session';
        this.app.use(sessionMiddleware);
      }
    }
  }

  return EggAppWorkerLoader as any;
};

export const createAgentWorkerLoader = () => {
  const AppWorkerLoader =
    require(getFramework())?.AgentWorkerLoader ||
    require('egg').AgentWorkerLoader;
  class EggAppWorkerLoader extends (AppWorkerLoader as any) {
    getEggPaths() {
      if (!this.appDir) {
        if (this.app.options.typescript || this.app.options.isTsMode) {
          process.env.EGG_TYPESCRIPT = 'true';
        }
        const result = parseNormalDir(
          this.app.options['baseDir'],
          this.app.options.isTsMode
        );
        this.baseDir = result.baseDir;
        this.options.baseDir = this.baseDir;
        this.appDir = this.app.appDir = result.appDir;
      }

      const result = super.getEggPaths();
      const monorepoRoot = findLernaRoot();
      if (monorepoRoot) {
        result.push(monorepoRoot);
      }

      if (process.env.MIDWAY_EGG_PLUGIN_PATH) {
        result.push(process.env.MIDWAY_EGG_PLUGIN_PATH);
      }

      if (process.cwd() !== this.appDir) {
        result.push(this.appDir);
      }

      const pathSet = new Set(result);
      return Array.from(pathSet);
    }

    protected getAppInfo(): EggAppInfo {
      if (!this.appInfo) {
        const appInfo: EggAppInfo | undefined = super.getAppInfo();
        // ROOT == HOME in prod env
        this.appInfo = extend(true, appInfo, {
          root:
            appInfo.env === 'local' || appInfo.env === 'unittest'
              ? this.appDir
              : appInfo.root,
          appDir: this.appDir,
        });
      }
      return this.appInfo;
    }

    protected getServerEnv() {
      // 这里和 egg 不同的是，一是修改了根路径，二是增加了环境变量
      let serverEnv = this.options.env;

      let envPath = join(this.appDir, 'config/env');
      if (!serverEnv && existsSync(envPath)) {
        serverEnv = readFileSync(envPath, 'utf8').trim();
      }

      envPath = join(this.appDir, 'config/serverEnv');
      if (!serverEnv && existsSync(envPath)) {
        serverEnv = readFileSync(envPath, 'utf8').trim();
      }

      if (!serverEnv) {
        serverEnv = process.env.MIDWAY_SERVER_ENV || process.env.EGG_SERVER_ENV;
      }

      if (!serverEnv) {
        serverEnv = super.getServerEnv();
      } else {
        serverEnv = serverEnv.trim();
      }

      if (serverEnv && !process.env.MIDWAY_SERVER_ENV) {
        process.env.MIDWAY_SERVER_ENV = serverEnv;
      }

      return serverEnv;
    }

    load() {
      this.framework = new MidwayWebFramework().configure({
        processType: 'agent',
        app: this.app,
        globalConfig: this.app.config,
      });
      this.bootstrap = new WebBootstrapStarter({
        isWorker: false,
      });
      this.bootstrap
        .configure({
          appDir: this.app.appDir,
        })
        .load(this.framework);
      this.app.beforeStart(async () => {
        await this.bootstrap.init();
        super.load();
      });
    }
  }

  return EggAppWorkerLoader as any;
};

export const createEggApplication = () => {
  const Application =
    require(getFramework())?.Application || require('egg').Application;
  class EggApplication extends (Application as any) {
    constructor(options) {
      // eslint-disable-next-line constructor-super
      super(options);
    }

    get [EGG_LOADER]() {
      return null;
    }

    get [EGG_PATH]() {
      return __dirname;
    }

    get loggers() {
      if (!(this as any)[LOGGERS]) {
        (this as any)[LOGGERS] = createLoggers(this as any);
      }
      return (this as any)[LOGGERS];
    }

    get router() {
      if ((this as any)[ROUTER]) {
        return (this as any)[ROUTER];
      }
      const router = ((this as any)[ROUTER] = new Router(
        { sensitive: true },
        this
      ));
      return router;
    }
  }

  return EggApplication as any;
};

export const createEggAgent = () => {
  const Agent = require(getFramework())?.Agent || require('egg').Agent;
  class EggAgent extends (Agent as any) {
    constructor(options) {
      // eslint-disable-next-line constructor-super
      super(options);
    }

    get [EGG_LOADER]() {
      return null;
    }

    get [EGG_PATH]() {
      return __dirname;
    }

    get loggers() {
      if (!(this as any)[LOGGERS]) {
        (this as any)[LOGGERS] = createLoggers(this as any);
      }
      return (this as any)[LOGGERS];
    }
  }

  return EggAgent as any;
};
