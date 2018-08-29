'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {

  constructor(ctx) {
    super(ctx);
    this.id = Math.random();
  }

  async index() {
    this.ctx.body = await this.ctx.service.user.getUser();
  }
}

module.exports = UserController;
