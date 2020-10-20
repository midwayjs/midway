'use strict';

const { BootstrapStarter } = require('@midwayjs/bootstrap');
const { MidwayWebFramework } = require('./src/framework');

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  async didLoad() {
    // 这里的逻辑是为了兼容老 cluster 模式
    this.framework = new MidwayWebFramework().configure({
      processType: 'agent',
      app: this.app,
    });
    this.bootstrap = new BootstrapStarter();
    this.bootstrap
      .configure({
        baseDir: this.app.appDir,
        globalConfig: this.app.config,
      })
      .load(this.framework);
    await this.bootstrap.init();
    this.app.options['webFramework'] = this.framework;
  }

  async willReady() {}
}

module.exports = AppBootHook;
