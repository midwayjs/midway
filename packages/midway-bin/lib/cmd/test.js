/* eslint-disable @typescript-eslint/no-var-requires */
const co = require('co');

class TestCommand extends require('egg-bin').TestCommand {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: midway-bin test [files] [options]';
  }

  async run(context) {
    if (! context.env.NODE_ENV) {
      context.env.NODE_ENV = 'unittest';
    }
    await co(super.run(context));
  }
}


module.exports = TestCommand;
