'use strict';

class DevCommand extends require('egg-bin').DevCommand {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: midway-bin dev [dir] [options]';
    this.defaultPort = 7001;
  }

  * run(context) {
    context.argv.framework = 'midway';
    yield this.run(context);
  }
}

module.exports = DevCommand;
