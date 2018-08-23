'use strict';
const {Autowire} = require('../../../../../src/factory/common/Autowire');
module.exports = class Bar {
  constructor() {
    this.cowboy = null;
    this.inject = Autowire.createInject('obj:bcd');
  }
};
