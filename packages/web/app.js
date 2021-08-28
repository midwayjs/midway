'use strict';

const pathMatching = require('egg-path-matching');
const { hasIdentifierMapping } = require('@midwayjs/decorator');

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
    if (this.app.config.midwayFeature['replaceEggLogger']) {
      // if use midway logger will be use midway custom context logger
      this.app.ContextLogger = this.app.webFramework.BaseContextLoggerClass;
    }
  }

  async didLoad() {
    if (this.app.loader['useEggSocketIO']) {
      // socketio 下会提前加入 session 中间件，这里删除，防止重复加载
      if (this.app.middleware.length && this.app.middleware[this.app.middleware.length - 1]._name === 'session') {
        this.app.middleware.pop();
      }
    }
  }

  async willReady() {
    await this.app.webFramework.loadExtension();
    const middlewareNames = this.coreMiddleware.concat(this.appMiddleware);
    // 等 midway 加载完成后，再去 use 中间件
    for (const name of middlewareNames) {
      if (hasIdentifierMapping(name)) {
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
        if (typeof this.app.middlewares[name] !== 'function') {
          throw new TypeError('this.app.middlewares.' + name + '() is not a function')
        }
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

    this.app.use(this.app.router.middleware());
    await this.app.webFramework.loadMidwayController();
  }

  async beforeClose() {
    await this.app.webFramework.stop();
  }
}

module.exports = AppBootHook;
