'use strict';

class DebugCommand extends require('egg-bin').DebugCommand {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: midway-bin debug [dir] [options]';
  }

  * run(context) {
    if (process.env.NODE_ENV) {
      process.env.NODE_ENV = 'local';
    }
    context.argv.framework = 'midway';
    yield super.run(context);
  }
}

module.exports = DebugCommand;
