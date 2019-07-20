'use strict';

class DebugCommand extends require('egg-bin').DebugCommand {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: midway-bin debug [dir] [options]';
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
      console.log(`[midway-bin] Not found framework ${module} and skip.`);
    }
  }
}

module.exports = DebugCommand;
