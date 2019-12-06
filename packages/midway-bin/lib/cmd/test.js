'use strict';
const co = require('co');

class TestCommand extends require('egg-bin').TestCommand {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: midway-bin test [files] [options]';
  }

  async run(context) {
    if (!context.env.NODE_ENV) {
      context.env.NODE_ENV = 'unittest';
    }
    return co(super.run(context));
  }
}

module.exports = TestCommand;
