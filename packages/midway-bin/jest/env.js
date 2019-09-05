const NodeEnvironment = require('jest-environment-node');

class JestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    require('ts-node/register');
    this.global.process.env.TS_MODE = 'true';
    await super.setup();
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = JestEnvironment;
