const NodeEnvironment = require('jest-environment-node');

class JestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    await super.setup();
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    require('ts-node/register')
    this.global.process.env.TS_MODE = 'true'
    return super.runScript(script);
  }
}

module.exports = JestEnvironment;
