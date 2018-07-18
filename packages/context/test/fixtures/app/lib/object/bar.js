'use strict';
const {InjectionPoint} = require('../../../../../src/factory/common/Autowire');
module.exports = class Bar {
  constructor() {
    this.cowboy = null;
    this.inject = InjectionPoint.create('obj:bcd');
  }
};
