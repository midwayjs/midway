import { Controller, Get, Provide, Inject } from '@midwayjs/core';
import { Context } from 'egg';

@Provide()
@Controller('/api/user')
export class UserController {
  @Inject()
  ctx: Context;

  @Get('/info')
  async api() {
    this.ctx.body = 'hello world';
  }
}
