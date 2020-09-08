import { BootstrapStarter } from '@midwayjs/bootstrap';
import { Framework } from './index';

class AppBootHook {
  app;
  bootstrap;
  framework;

  constructor(app) {
    this.app = app;
  }

  async didLoad() {
    // 这里的逻辑是为了兼容老 cluster 模式
    if (this.app.options['isClusterMode'] !== false) {
      this.framework = new Framework().configure({
        processType: 'agent',
        app: this.app
      });
      this.bootstrap = new BootstrapStarter();
      this.bootstrap
        .configure({
          baseDir: this.app.appDir,
        })
        .load(this.framework);
      await this.bootstrap.init();
      this.app.options['webFramework'] = this.framework;
    }
  }

  async willReady() {
  }

}

module.exports = AppBootHook;
