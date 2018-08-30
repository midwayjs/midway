'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {

  constructor(ctx) {
    super(ctx);
    this.id = Math.random();
  }

  async index() {
    this.ctx.body = 'hi, egg' + this.id;
  }
}

module.exports = HomeController;
