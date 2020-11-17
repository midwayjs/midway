import { parseNormalDir } from './utils';
import * as extend from 'extend2';
import { EggAppInfo } from 'egg';
import { BootstrapStarter } from '@midwayjs/bootstrap';
import { MidwayWebFramework } from './framework';
import { safelyGet, safeRequire } from '@midwayjs/core';
import { join } from 'path';

const EGG_LOADER = Symbol.for('egg#loader');
const EGG_PATH = Symbol.for('egg#eggPath');

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
  const AppWorkerLoader = require(getFramework()).AppWorkerLoader;
  class EggAppWorkerLoader extends (AppWorkerLoader as any) {
    app: any;
    framework;
    bootstrap;

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

      if (process.env.MIDWAY_EGG_PLUGIN_PATH) {
        const result = super.getEggPaths();
        return result.concat(process.env.MIDWAY_EGG_PLUGIN_PATH);
      }
      return super.getEggPaths();
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

    load() {
      this.framework = new MidwayWebFramework().configure({
        processType: 'application',
        app: this.app,
        globalConfig: this.app.config,
      });
      this.bootstrap = new BootstrapStarter();
      this.bootstrap
        .configure({
          baseDir: this.app.appDir,
        })
        .load(this.framework);
      this.app.beforeStart(async () => {
        await this.bootstrap.init();
        super.load();
        await this.framework.loadLifeCycles();
      });
    }
  }

  return EggAppWorkerLoader as any;
};

export const createAgentWorkerLoader = () => {
  const AppWorkerLoader = require(getFramework()).AgentWorkerLoader;
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

      if (process.env.MIDWAY_EGG_PLUGIN_PATH) {
        return super.getEggPaths().concat(process.env.MIDWAY_EGG_PLUGIN_PATH);
      }
      return super.getEggPaths();
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

    load() {
      this.framework = new MidwayWebFramework().configure({
        processType: 'agent',
        app: this.app,
        globalConfig: this.app.config,
      });
      this.bootstrap = new BootstrapStarter();
      this.bootstrap
        .configure({
          baseDir: this.app.appDir,
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
  const Application = require(getFramework()).Application;
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
  }

  return EggApplication as any;
};

export const createEggAgent = () => {
  const Agent = require(getFramework()).Agent;
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
  }

  return EggAgent as any;
};
