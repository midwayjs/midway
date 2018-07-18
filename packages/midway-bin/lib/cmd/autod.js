'use strict';

class AutodCommand extends require('egg-bin/lib/cmd/autod') {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: midway-bin autod';
  }
}

module.exports = AutodCommand;
