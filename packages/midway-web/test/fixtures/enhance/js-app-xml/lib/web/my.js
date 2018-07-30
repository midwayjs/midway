'use strict';
const {BaseController} = require('../../../../../../');

module.exports = class MyController extends BaseController {
  constructor() {
    super();

    this.$$mytest = null;
    this.$$hhh = null;
    this.$plugin2 = null;
    this.hello = null;
    this.$logger = null;
  }

  init() {
    this.route('get', '/my_logger', async ctx => {
      this.$logger.debug('this is debug log');
      ctx.body = this.$logger ? 'not null' : 'null';
    });
    this.route('get', '/my', async (ctx) => {
      if (this.hello.hhh !== this.$$hhh) {
        throw new Error(`${this.hello.hhh} is not eq ${this.$$hhh}`);
      }
      ctx.body = this.hello.say('test');
    });

    this.route('get', '/my_plugin2', async ctx => {
      ctx.body = this.$plugin2 ? `plugin2 is not null ${this.$plugin2.text}` : 'plugin2 is null';
    });

    this.route('get', '/my_test', async ctx => {
      ctx.body = this.$$mytest;
    });
  }
}