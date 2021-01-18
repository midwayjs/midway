'use strict';

const pathMatching = require('egg-path-matching');

class AppBootHook {
  constructor(app) {
    this.app = app;
    this.coreMiddleware = [];
    this.appMiddleware = [];
  }

  configDidLoad() {
    // 先清空，防止加载到 midway 中间件出错
    this.coreMiddleware = this.app.loader.config.coreMiddleware;
    this.app.loader.config.coreMiddleware = [];
    this.appMiddleware = this.app.loader.config.appMiddleware;
    this.app.loader.config.appMiddleware = [];
  }

  async didLoad() {
    const middlewareNames = this.coreMiddleware.concat(this.appMiddleware);
    // 等 midway 加载完成后，再去 use 中间件
    for (const name of middlewareNames) {
      if (this.app.getApplicationContext().registry.hasDefinition(name)) {
        const mwIns = await this.app.generateMiddleware(name);
        mwIns._name = name;
        this.app.use(mwIns);
      } else {
        // egg
        const options = this.app.config[name] || {};
        if (options.enable === false) {
          continue;
        }
        // support options.match and options.ignore
        const mw = this.app.middlewares[name](options, this.app);
        if (!options.match && !options.ignore) {
          this.app.use(mw);
        } else {
          const match = pathMatching(options);
          const fn = (ctx, next) => {
            if (!match(ctx)) return next();
            return mw(ctx, next);
          };
          fn._name = mw._name + 'middlewareWrapper';
          this.app.use(fn);
        }
      }
    }

    await this.app.webFramework.loadMidwayController();
  }

  async willReady() {}

  async beforeClose() {
    await this.app.webFramework.stop();
  }
}

module.exports = AppBootHook;
