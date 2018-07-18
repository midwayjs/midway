/* istanbul ignore next */
'use strict';

/* istanbul ignore next */
class CovCommand extends require('egg-bin').CovCommand {
  constructor(argv) {
    super(argv);
    this.usage = 'Usage: midway-bin cov';
  }
}

module.exports = CovCommand;
