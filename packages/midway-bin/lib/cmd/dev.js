'use strict';

class DevCommand extends require('egg-bin/lib/cmd/dev') {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: midway-bin dev [dir] [options]';
    this.defaultPort = process.env.PORT || 7001;
  }

  * run(context) {
    if (!context.argv.framework) {
      context.argv.framework = this.findFramework('midway') || this.findFramework('midway-mirror');
    }
    yield super.run(context);
  }

  findFramework(module) {
    try {
      if (require.resolve(module)) {
        return module;
      }
    } catch (err) {
      console.log(`Not found framework ${module} and skip.`);
    }
  }
}

module.exports = DevCommand;
