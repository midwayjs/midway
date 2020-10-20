'use strict';

const { Bootstrap } = require('@midwayjs/bootstrap');
const { MidwayWebFramework } = require('./src/framework');
const pathMatching = require('egg-path-matching');
const { safelyGet } = require('@midwayjs/core');

const { CONFIG_KEY, LOGGER_KEY, PLUGIN_KEY } = require('@midwayjs/decorator');

class AppBootHook {
  constructor(app) {
    this.app = app;
    this.appMiddleware = [];
  }

  configDidLoad() {
    // 先清空，防止加载到 midway 中间件出错
    this.appMiddleware = this.app.config.appMiddleware;
    this.app.config.appMiddleware = [];
  }

  async didLoad() {
    this.framework = new MidwayWebFramework().configure({
      processType: 'application',
      app: this.app,
      globalConfig: this.app.config,
    });
    Bootstrap.configure({
      baseDir: this.app.appDir,
    }).load(this.framework);
    await Bootstrap.run();
    this.app.options['webFramework'] = this.framework;

    // register plugin
    this.app.applicationContext.registerDataHandler(
      PLUGIN_KEY,
      (key, target) => {
        return this.app[key];
      }
    );

    // register config
    this.app.applicationContext.registerDataHandler(CONFIG_KEY, key => {
      return key ? safelyGet(key, this.app.config) : this.app.config;
    });

    // register logger
    this.app.applicationContext.registerDataHandler(LOGGER_KEY, key => {
      if (this.app.getLogger) {
        return this.app.getLogger(key);
      }
      return this.app.coreLogger;
    });

    // 等 midway 加载完成后，再去 use 中间件
    for (const name of this.appMiddleware) {
      if (this.app.getApplicationContext().registry.hasDefinition(name)) {
        const mwIns = await this.app.generateMiddleware(name);
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
  }

  async willReady() {}
}

module.exports = AppBootHook;
