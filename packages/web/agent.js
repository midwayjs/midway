'use strict';

class AgentBootHook {
  constructor(app) {
    this.app = app;
  }

  async didLoad() {
  }

  async willReady() {}
}

module.exports = AgentBootHook;
