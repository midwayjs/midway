import type { MidwayWebFramework } from './framework';
import { RouterParamValue } from '@midwayjs/decorator';
import { parseNormalDir } from './utils';
import * as extend from 'extend2';
// import { join } from 'path';
import { EggAppInfo } from 'egg';
import { IMidwayWebApplication } from './interface';

const {
  AppWorkerLoader,
  AgentWorkerLoader,
  Application,
  Agent,
} = require('egg');

// const pathMatching = require('egg-path-matching');

const EGG_LOADER = Symbol.for('egg#loader');
const EGG_PATH = Symbol.for('egg#eggPath');

export const createAppWorkerLoader = AppWorkerLoader => {
  class EggAppWorkerLoader extends (AppWorkerLoader as any) {
    app: IMidwayWebApplication & {
      appOptions: {
        typescript?: boolean;
        isTsMode?: boolean;
      };
      appDir: string;
      baseDir: string;
      middlewares: [];
    };

    getEggPaths() {
      if (!this.appDir) {
        // 这里的逻辑是为了兼容老 cluster 模式
        if (this.app.appOptions.typescript || this.app.appOptions.isTsMode) {
          process.env.EGG_TYPESCRIPT = 'true';
        }
        const result = parseNormalDir(
          this.app.appOptions['baseDir'],
          this.app.appOptions.isTsMode
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

    // loadMiddleware(opt) {
    //   this.timing.start('Load Middleware');
    //   const app = this.app;
    //
    //   console.log(app.middlewares)
    //
    //   // load middleware to app.middleware
    //   opt = Object.assign({
    //     call: false,
    //     override: true,
    //     caseStyle: 'lower',
    //     directory: this.getLoadUnits().map(unit => join(unit.path, 'app/middleware')),
    //   }, opt);
    //   const middlewarePaths = opt.directory;
    //   this.loadToApp(middlewarePaths, 'middlewares', opt);
    //
    //   for (const name in app.middlewares) {
    //     Object.defineProperty(app.middleware, name, {
    //       get() {
    //         return app.middlewares[name];
    //       },
    //       enumerable: false,
    //       configurable: false,
    //     });
    //   }
    //
    //   this.options.logger.info('Use coreMiddleware order: %j', this.config.coreMiddleware);
    //   this.options.logger.info('Use appMiddleware order: %j', this.config.appMiddleware);
    //
    //   // use middleware ordered by app.config.coreMiddleware and app.config.appMiddleware
    //   const middlewareNames = this.config.coreMiddleware.concat(this.config.appMiddleware);
    //   const middlewaresMap = new Map();
    //   for (const name of middlewareNames) {
    //     if (!app.middlewares[name]) {
    //       throw new TypeError(`Middleware ${name} not found`);
    //     }
    //     if (middlewaresMap.has(name)) {
    //       throw new TypeError(`Middleware ${name} redefined`);
    //     }
    //     middlewaresMap.set(name, true);
    //
    //     const options = this.config[name] || {};
    //     let mw: any = app.middlewares[name];
    //     mw = mw(options, app);
    //     mw._name = name;
    //     // middlewares support options.enable, options.ignore and options.match
    //     mw = wrapMiddleware(mw, options);
    //     if (mw) {
    //       app.use(mw);
    //       this.options.logger.info('[egg:loader] Use middleware: %s', name);
    //     } else {
    //       this.options.logger.info('[egg:loader] Disable middleware: %s', name);
    //     }
    //   }
    //
    //   this.options.logger.info('[egg:loader] Loaded middleware from %j', middlewarePaths);
    //   this.timing.end('Load Middleware');
    // }

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
  }

  return EggAppWorkerLoader as any;
};

export const createAgentWorkerLoader = AppWorkerLoader => {
  class EggAppWorkerLoader extends (AppWorkerLoader as any) {
    getEggPaths() {
      if (!this.appDir) {
        if (this.app.appOptions.typescript || this.app.appOptions.isTsMode) {
          process.env.EGG_TYPESCRIPT = 'true';
        }
        const result = parseNormalDir(
          this.app.appOptions['baseDir'],
          this.app.appOptions.isTsMode
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
  }

  return EggAppWorkerLoader as any;
};

export const createEggApplication = Application => {
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

    get appOptions() {
      return this.options;
    }

    get midwayWebFramework(): MidwayWebFramework {
      return this.appOptions['webFramework'];
    }

    get applicationContext() {
      return this.midwayWebFramework.getApplicationContext();
    }

    getApplicationContext() {
      return this.applicationContext;
    }

    generateController(
      controllerMapping: string,
      routeArgsInfo?: RouterParamValue[],
      routerResponseData?: any[]
    ) {
      return this.midwayWebFramework.generateController(
        controllerMapping,
        routeArgsInfo,
        routerResponseData
      );
    }

    async generateMiddleware(middlewareId: string) {
      return this.midwayWebFramework.generateMiddleware(middlewareId);
    }

    get baseDir() {
      return this.loader.baseDir;
    }
  }

  return EggApplication as any;
};

export const createEggAgent = Agent => {
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

    get appOptions() {
      return this.options;
    }

    get midwayWebFramework(): MidwayWebFramework {
      return this.appOptions['webFramework'];
    }

    get applicationContext() {
      return this.midwayWebFramework.getApplicationContext();
    }

    getApplicationContext() {
      return this.applicationContext;
    }

    get baseDir() {
      return this.loader.baseDir;
    }
  }

  return EggAgent as any;
};

const EggAppWorkerLoader = createAppWorkerLoader(AppWorkerLoader);

const BaseEggApplication = createEggApplication(Application);

const EggAgentWorkerLoader = createAgentWorkerLoader(AgentWorkerLoader);

const BaseEggAgent = createEggAgent(Agent);

export class EggApplication extends BaseEggApplication {
  get [EGG_LOADER]() {
    return EggAppWorkerLoader;
  }

  get [EGG_PATH]() {
    return __dirname;
  }
}

export class EggAgent extends BaseEggAgent {
  get [EGG_LOADER]() {
    return EggAgentWorkerLoader;
  }

  get [EGG_PATH]() {
    return __dirname;
  }
}

export { EggApplication as Application };
export { EggAgent as Agent };

// function wrapMiddleware(mw, options) {
//   // support options.enable
//   if (options.enable === false) return null;
//
//   // support generator function
//   // mw = utils.middleware(mw);
//
//   // support options.match and options.ignore
//   if (!options.match && !options.ignore) return mw;
//   const match = pathMatching(options);
//
//   const fn = (ctx, next) => {
//     if (!match(ctx)) return next();
//     return mw(ctx, next);
//   };
//   fn._name = mw._name + 'middlewareWrapper';
//   return fn;
// }
