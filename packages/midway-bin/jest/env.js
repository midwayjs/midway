'use strict';
const NodeEnvironment = require('jest-environment-node');

/* eslint-disable no-useless-constructor */
class JestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    /* eslint-disable node/no-extraneous-require */
    require('ts-node/register');
    this.global.process.env.MIDWAY_TS_MODE = 'true';
    this.global.process.env.MIDWAY_JEST_MODE = 'true';
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
