'use strict';
const { debuglog } = require('util');
const debug = debuglog('midway:debug');

class AgentBootHook {
  constructor(app) {
    this.app = app;
  }

  configDidLoad() {
    debug('[egg:lifecycle]: agent configDidLoad');
  }

  async didLoad() {
    debug('[egg:lifecycle]: agent didLoad');
  }

  async willReady() {
    debug('[egg:lifecycle]: agent willReady');
  }

  async beforeClose() {
    debug('[egg:lifecycle]: agent beforeClose');
    await this.app.applicationContext.stop();
  }
}

module.exports = AgentBootHook;
