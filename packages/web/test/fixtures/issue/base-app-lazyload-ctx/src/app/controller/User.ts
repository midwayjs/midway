import { Controller, Get, Provide, Inject } from '@midwayjs/decorator';
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
