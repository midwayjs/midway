'use strict';

module.exports = class MyController {
  constructor() {
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

    this.route('get', '/my_loggertest', async ctx => {
      try {
        this.loggertest.warn('my_loggertest output test!');
      } catch (error) {
        this.$logger.error(error.stack);
      }
      ctx.body = this.loggertest ? `loggertest is not null` : `loggertest is null`;
    });

    this.route('get', '/my_plugintest', async ctx => {
      ctx.body = this.plugintest ? `plugintest is not null ${this.plugintest.text}` : `plugintest is null`;
    });
  }
}