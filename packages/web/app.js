'use strict';

const pathMatching = require('egg-path-matching');
const { debuglog } = require('util');

const debug = debuglog('midway:debug');

class AppBootHook {
  constructor(app) {
    this.app = app;
    this.coreMiddleware = [];
    this.appMiddleware = [];
  }

  configDidLoad() {
    debug('[egg lifecycle]: app configDidLoad');
    // 先清空，防止加载到 midway 中间件出错
    this.coreMiddleware = this.app.loader.config.coreMiddleware;
    this.app.loader.config.coreMiddleware = [];
    this.appMiddleware = this.app.loader.config.appMiddleware;
    this.app.loader.config.appMiddleware = [];
  }

  async didLoad() {
    debug('[egg lifecycle]: app didLoad');
    if (this.app.loader['useEggSocketIO']) {
      // egg socket.io 需要这个中间件
      // const session = this.app.getMiddleware().findItem('session');
      // this.app.middleware.push(session);
    }
  }

  async willReady() {
    debug('[egg lifecycle]: app willReady');
    const middlewareNames = this.coreMiddleware.concat(this.appMiddleware);
    // 等 midway 加载完成后，再去 use 中间件
    for (const name of middlewareNames) {
      if (this.app.getApplicationContext().registry.hasDefinition(name)) {
        await this.app.useMiddleware(name);
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
          await this.app.useMiddleware(fn);
        }
      }
    }

    const bodyPatch = async (ctx, next) => {
      await next();
      if (
        ctx.body === undefined &&
        !ctx.response._explicitStatus &&
        ctx._matchedRoute
      ) {
        // 如果进了路由，重新赋值，防止 404
        ctx.body = undefined;
      }
      if (
        ctx.response._midwayControllerNullBody &&
        ctx.body &&
        ctx.status === 204
      ) {
        ctx.status = 200;
      }
    };

    this.app.getMiddleware().insertAfter(bodyPatch, 'notfound');

    const eggRouterMiddleware = this.app.router.middleware();
    eggRouterMiddleware._name = 'eggRouterMiddleware';
    this.app.useMiddleware(eggRouterMiddleware);

    if (process.env['EGG_CLUSTER_MODE'] === 'true') {
      const lifeCycleService = this.app.applicationContext.get('midwayWebLifeCycleService');
      // exec onReady()
      await lifeCycleService.runReady();
      // 多进程时的路由加载必须放在这里，中间件加载之后
      const framework = this.app.applicationContext.get('midwayWebFramework');
      await framework.loadMidwayController();
    }

    this.app.emit('application-ready');
  }

  async beforeClose() {
    debug('[egg lifecycle]: app beforeClose');
  }
}

module.exports = AppBootHook;
