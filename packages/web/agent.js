'use strict';

class AgentBootHook {
  constructor(app) {
    this.app = app;
  }

  configDidLoad() {
    if (this.app.config.midwayFeature['replaceEggLogger']) {
      // if use midway logger will be use midway custom context logger
      this.app.ContextLogger = this.app.webFramework.BaseContextLoggerClass;
    }
  }

  async didLoad() {}

  async willReady() {}
}

module.exports = AgentBootHook;
