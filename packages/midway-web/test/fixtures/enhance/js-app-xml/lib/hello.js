'use strict';
module.exports = class Hello {
  constructor(options) {
    this.options = options;
  }

  doPlugin2() {
    return this.options.plugin2.text;
  }

  say(name) {
    return `hello ${name}`;
  }
}