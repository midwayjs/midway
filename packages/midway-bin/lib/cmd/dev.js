'use strict';

class DevCommand extends require('egg-bin').DevCommand {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: midway-bin dev [dir] [options]';
    this.defaultPort = 6001;
  }
}

module.exports = DevCommand;
