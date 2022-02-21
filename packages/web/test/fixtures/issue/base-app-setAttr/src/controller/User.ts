import { Controller, Get, Inject } from '@midwayjs/decorator';
import { Context } from 'egg';

@Controller('/api/user')
export class UserController {
  @Inject()
  ctx: Context;

  @Get('/')
  async api() {
    this.ctx.body = 'hello world' + this.ctx.getAttr('abc');
  }
}
