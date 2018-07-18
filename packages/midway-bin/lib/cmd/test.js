'use strict';

class TestCommand extends require('egg-bin').TestCommand {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: midway-bin test [files] [options]';
  }
}

module.exports = TestCommand;
