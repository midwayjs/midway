'use strict';
const resolver = require('../util').resolveModule;
const co = require('co');

class DevCommand extends require('egg-bin/lib/cmd/dev') {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: midway-bin dev [dir] [options]';
    this.defaultPort = process.env.PORT || 7001;
  }

  async run(context) {
    if (!context.argv.framework) {
      context.argv.framework = this.findFramework('midway') || this.findFramework('midway-mirror');
    }
    await co(super.run(context));
  }

  findFramework(module) {
    return resolver(module);
  }
}

module.exports = DevCommand;
