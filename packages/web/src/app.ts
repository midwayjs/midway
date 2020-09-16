import { Bootstrap } from '@midwayjs/bootstrap';
import { Framework } from './index';

class AppBootHook {
  app;
  bootstrap;
  framework;
  appMiddleware = [];

  constructor(app) {
    this.app = app;
  }

  configDidLoad() {
    // 先清空，防止加载到 midway 中间件出错
    this.appMiddleware = this.app.config.appMiddleware;
    this.app.config.appMiddleware = [];
  }

  async didLoad() {
    // 这里的逻辑是为了兼容老 cluster 模式
    if (this.app.options['isClusterMode'] !== false) {
      this.framework = new Framework().configure({
        processType: 'application',
        app: this.app
      });
      Bootstrap
        .configure({
          baseDir: this.app.appDir,
        })
        .load(this.framework);
      await Bootstrap.run();
      this.app.options['webFramework'] = this.framework;
    }

    // 等 midway 加载完成后，再去 use 中间件
    for (const name of this.appMiddleware) {
      if (this.app.getApplicationContext().registry.hasDefinition(name)) {
        const mwIns = await this.app.generateMiddleware(name);
        this.app.use(mwIns);
      } else {
        // egg
        this.app.use(this.app.middlewares[name](this.app.config[name]));
      }
    }

  }

  async willReady() {
  }

}

module.exports = AppBootHook;
