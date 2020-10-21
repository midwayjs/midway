'use strict';

const { BootstrapStarter } = require('@midwayjs/bootstrap');
const { MidwayWebFramework } = require('./dist/framework');
const pathMatching = require('egg-path-matching');

class AppBootHook {
  constructor(app) {
    this.app = app;
    this.appMiddleware = [];
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
  }

  configDidLoad() {
    // 先清空，防止加载到 midway 中间件出错
    this.appMiddleware = this.app.config.appMiddleware;
    this.app.config.appMiddleware = [];
  }

  async didLoad() {
    await this.bootstrap.init();
    // this.app.options['webFramework'] = this.framework;

    // 等 midway 加载完成后，再去 use 中间件
    for (const name of this.appMiddleware) {
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
        const mw = this.app.middlewares[name](options);
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

    await this.framework.loadMidwayController();
  }

  async willReady() {}
}

module.exports = AppBootHook;
