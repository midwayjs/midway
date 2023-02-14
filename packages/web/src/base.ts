import {
  findLernaRoot,
  initializeAgentApplicationContext,
  parseNormalDir,
} from './utils';
import { EggAppInfo } from 'egg';
import {
  getCurrentApplicationContext,
  MidwayConfigService,
  safelyGet,
  safeRequire,
  extend,
  listModule,
  MidwayFrameworkService,
  HTTP_SERVER_KEY,
} from '@midwayjs/core';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { createLoggers } from './logger';
import { EggRouter as Router } from '@eggjs/router';
import { debuglog } from 'util';
import { MidwayWebLifeCycleService } from './framework/lifecycle';
import { MidwayWebFramework } from './framework/web';
import { RUN_IN_AGENT_KEY } from './interface';
const ROUTER = Symbol('EggCore#router');
const EGG_LOADER = Symbol.for('egg#loader');
const EGG_PATH = Symbol.for('egg#eggPath');
const LOGGERS = Symbol('EggApplication#loggers');

const debug = debuglog('midway:debug');

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
    framework: MidwayWebFramework;
    bootstrap;
    useEggSocketIO = false;
    applicationContext;
    lifecycleService: MidwayWebLifeCycleService;

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
      /**
       * 由于使用了新的 hook 方式，这个时候 midway 已经初始化了一部分
       * 但是我们把初始化分为了两个部分，framework 相关的留到这里初始化
       * 避免 app 不存在，也能尽可能和单进程模式执行一样的逻辑
       */

      // lazy initialize framework
      if (process.env['EGG_CLUSTER_MODE'] === 'true') {
        this.app.beforeStart(async () => {
          debug(
            '[egg]: start "initialize framework service with lazy in app.load"'
          );
          const applicationContext = getCurrentApplicationContext();
          applicationContext.bind(MidwayWebLifeCycleService);
          /**
           * 这里 logger service 已经被 get loggers() 初始化过了，就不需要在这里初始化了
           */
          // framework/config/plugin/logger/app decorator support
          await applicationContext.getAsync(MidwayFrameworkService, [
            applicationContext,
            {
              application: this.app,
            },
          ]);

          this.app.once('server', async server => {
            this.framework.setServer(server);
            // register httpServer to applicationContext
            applicationContext.registerObject(HTTP_SERVER_KEY, server);
            await this.lifecycleService.afterInit();
          });

          // 这里生命周期走到 onReady
          this.lifecycleService = await applicationContext.getAsync(
            MidwayWebLifeCycleService,
            [applicationContext]
          );

          // 执行加载框架初始化
          this.framework = await applicationContext.getAsync(
            MidwayWebFramework
          );
        });
      }
    }

    loadOrigin() {
      debug('[egg]: application: run load()');
      super.load();
    }

    loadConfig() {
      super.loadConfig();
      const configService =
        getCurrentApplicationContext().get(MidwayConfigService);
      configService.addObject(this.config, true);
      Object.defineProperty(this, 'config', {
        get() {
          return configService.getConfiguration();
        },
      });
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
  class EggAgentWorkerLoader extends (AppWorkerLoader as any) {
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
      this.app.beforeStart(async () => {
        debug('[egg]: start "initializeAgentApplicationContext"');
        await initializeAgentApplicationContext(this.app);
        super.load();

        debug('[egg]: start runAgent decorator');
        const runInAgentModules = listModule(RUN_IN_AGENT_KEY);
        for (const module of runInAgentModules) {
          await this.app.applicationContext.getAsync(module);
        }

        debug('[egg]: agent load run complete');
      });
    }

    loadConfig() {
      super.loadConfig();
      if (getCurrentApplicationContext()) {
        const configService =
          getCurrentApplicationContext().get(MidwayConfigService);
        configService.addObject(this.config, true);
        Object.defineProperty(this, 'config', {
          get() {
            return configService.getConfiguration();
          },
        });
      }
    }
  }

  return EggAgentWorkerLoader as any;
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
        (this as any)[LOGGERS] = createLoggers(this as any, 'app');
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

    dumpConfig() {
      if (this.config?.egg?.dumpConfig !== false) {
        super.dumpConfig();
      }
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
        (this as any)[LOGGERS] = createLoggers(this as any, 'agent');
      }
      return (this as any)[LOGGERS];
    }

    dumpConfig() {
      if (this.config?.egg?.dumpConfig !== false) {
        super.dumpConfig();
      }
    }
  }

  return EggAgent as any;
};
