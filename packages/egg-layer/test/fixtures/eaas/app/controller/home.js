'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }
  async buffer() {
    const { ctx } = this;
    ctx.setHeader('x-res', 'buffer');
    // assert
    ctx.body = Buffer.from('hi, egg');
  }
}

module.exports = HomeController;
