const extend = require('extend2');

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
    loadConfig() {
      super.loadConfig();
      this.afterLoadConfig();
    }

    afterLoadConfig() {
      // mix config
      extend(true, this.config, this.app.appOptions['allConfig']);
    }

    getEggPaths() {
      if (!this.appDir) {
        this.baseDir = this.app.appOptions['sourceDir'];
        this.options.baseDir = this.baseDir;
        this.appDir = this.app.appOptions['baseDir'];
      }
      if (process.env.MIDWAY_EGG_PLUGIN_PATH) {
        return super.getEggPaths().concat(process.env.MIDWAY_EGG_PLUGIN_PATH);
      }
      return super.getEggPaths();
    }

    loadMiddleware(opt) {
      return super.loadMiddleware(opt);
    }
  }

  return EggAppWorkerLoader as any;
};

export const createAgentWorkerLoader = AppWorkerLoader => {
  class EggAppWorkerLoader extends (AppWorkerLoader as any) {
    loadConfig() {
      super.loadConfig();
      this.afterLoadConfig();
    }

    afterLoadConfig() {
      // mix config
      extend(true, this.config, this.app.appOptions['allConfig']);
    }

    getEggPaths() {
      if (!this.appDir) {
        this.baseDir = this.app.appOptions['sourceDir'];
        this.appDir = this.app.appOptions['baseDir'];
      }
      if (process.env.MIDWAY_EGG_PLUGIN_PATH) {
        return super.getEggPaths().concat(process.env.MIDWAY_EGG_PLUGIN_PATH);
      }
      return super.getEggPaths();
    }
  }

  return EggAppWorkerLoader as any;
};

export const createEggApplication = Application => {
  class EggApplication extends (Application as any) {
    constructor(options) {
      super(options);
    }

    get appOptions() {
      return this.options;
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

export const createEggAgent = Agent => {
  class EggAgent extends (Agent as any) {
    constructor(options) {
      super(options);
    }

    get appOptions() {
      return this.options;
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
  constructor(options) {
    super(options);
  }

  get [EGG_LOADER]() {
    return EggAppWorkerLoader;
  }

  get [EGG_PATH]() {
    return __dirname;
  }
}

export class EggAgent extends BaseEggAgent {
  constructor(options) {
    super(options);
  }

  get [EGG_LOADER]() {
    return EggAgentWorkerLoader;
  }

  get [EGG_PATH]() {
    return __dirname;
  }
}

export { EggApplication as Application };
export { EggAgent as Agent };
