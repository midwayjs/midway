'use strict';

class DevCommand extends require('egg-bin/lib/cmd/dev') {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: midway-bin dev [dir] [options]';
    this.defaultPort = 7001;
  }

  * run(context) {
    context.argv.framework = 'midway';
    yield super.run(context);
  }
}

module.exports = DevCommand;
