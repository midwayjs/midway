'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async getMethod() {
    const { ctx } = this;
    ctx.type = 'html';
    ctx.body = 'Hello World';
  }
  async getQueryMethod() {
    const { ctx } = this;
    ctx.body = {
      query: ctx.query
    };
  }
  async postMethod() {
    const { ctx } = this;
    ctx.body = 'Hello World, post';
  }
  async postBodyMethod() {
    const { ctx } = this;
    ctx.body = {
      body: ctx.request.body
    };
  }
  async buffer() {
    const { ctx } = this;
    ctx.setHeader('x-res', 'buffer');
    // assert
    ctx.body = Buffer.from('hi, egg');
  }
  async gotIP() {
    const { ctx } = this;
    ctx.body = 'ip=' + ctx.ip;
  }
}

module.exports = HomeController;
