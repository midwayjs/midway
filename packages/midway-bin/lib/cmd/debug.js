'use strict';
const resolver = require('../util').resolveModule;
const co = require('co');

class DebugCommand extends require('egg-bin').DebugCommand {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: midway-bin debug [dir] [options]';
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

module.exports = DebugCommand;
