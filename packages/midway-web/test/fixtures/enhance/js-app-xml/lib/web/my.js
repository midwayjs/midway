'use strict';
const {BaseController} = require('../../../../../../');

module.exports = class MyController extends BaseController {
  constructor() {
    super();

    this.$plugin2 = null;
    this.hello = null;
  }

  init() {
    this.route('get', '/my', async (ctx) => {
      ctx.body = this.hello.say('test');
    });

    this.route('get', '/my_plugin2', async ctx => {
      ctx.body = this.$plugin2 ? `plugin2 is not null ${this.$plugin2.text}` : 'plugin2 is null';
    });
  }
}