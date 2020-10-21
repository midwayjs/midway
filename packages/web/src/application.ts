// import type { MidwayWebFramework } from './framework';
// import { RouterParamValue } from '@midwayjs/decorator';
import { parseNormalDir } from './utils';
import * as extend from 'extend2';
import { EggAppInfo } from 'egg';
import { join } from 'path';

const {
  AppWorkerLoader,
  AgentWorkerLoader,
  Application,
  Agent,
} = require('egg');

const EGG_LOADER = Symbol.for('egg#loader');
const EGG_PATH = Symbol.for('egg#eggPath');

export const createAppWorkerLoader = AppWorkerLoader => {
  class EggAppWorkerLoader extends (AppWorkerLoader as any) {
    app: any;

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
  }

  return EggAppWorkerLoader as any;
};

export const createAgentWorkerLoader = AppWorkerLoader => {
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
    //
    // get appOptions() {
    //   return this.options;
    // }
    //
    // get midwayWebFramework(): MidwayWebFramework {
    //   return this.appOptions['webFramework'];
    // }
    //
    // get applicationContext() {
    //   return this.midwayWebFramework.getApplicationContext();
    // }
    //
    // getApplicationContext() {
    //   return this.applicationContext;
    // }
    //
    // generateController(
    //   controllerMapping: string,
    //   routeArgsInfo?: RouterParamValue[],
    //   routerResponseData?: any[]
    // ) {
    //   return this.midwayWebFramework.generateController(
    //     controllerMapping,
    //     routeArgsInfo,
    //     routerResponseData
    //   );
    // }
    //
    // async generateMiddleware(middlewareId: string) {
    //   return this.midwayWebFramework.generateMiddleware(middlewareId);
    // }
    //
    // get baseDir() {
    //   return this.loader.baseDir;
    // }
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
    return join(__dirname, '../');
  }
}

export class EggAgent extends BaseEggAgent {
  get [EGG_LOADER]() {
    return EggAgentWorkerLoader;
  }

  get [EGG_PATH]() {
    return join(__dirname, '../');
  }
}

export { EggApplication as Application };
export { EggAgent as Agent };
