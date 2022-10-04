import { Controller, Get, Provide, Inject } from '@midwayjs/core';
import { Service } from '../../Service';
import { Context } from 'egg';

@Provide()
@Controller('/api/user')
export class UserController {
  @Inject()
  ctx: Context;

  @Inject()
  service: Service;

  @Get('/info')
  async api() {
    this.ctx.body = await this.service.user.userinfo();
  }
}
