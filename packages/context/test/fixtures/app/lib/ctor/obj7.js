const assert = require('assert');

module.exports = class Obj7 {
  constructor(options) {
    assert(options.hello, 'hello is null')
    console.log(options);
    this.options = options;
  }

  getHello() {
    return this.options.hello;
  }
}