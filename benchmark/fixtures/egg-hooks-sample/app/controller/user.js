'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {

  constructor(ctx) {
    super(ctx);
    this.id = Math.random();
  }

  async index() {
    const id = this.ctx.params.id;
    this.ctx.body = await this.ctx.service.user.getUser({id});
  }
}

module.exports = UserController;
