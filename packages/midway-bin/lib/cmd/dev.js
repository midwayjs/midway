'use strict';

class DevCommand extends require('egg-bin/lib/cmd/dev') {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: midway-bin dev [dir] [options]';
    this.defaultPort = process.env.PORT || 7001;
  }

  * run(context) {
    if (!context.argv.framework) {
      if (require.resolve('midway')) {
        context.argv.framework = 'midway';
      } else if (require.resolve('midway-mirror')) {
        context.argv.framework = 'midway-mirror';
      }
    }
    yield super.run(context);
  }
}

module.exports = DevCommand;
