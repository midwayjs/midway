import { Controller, Get, Provide, Inject } from '@midwayjs/decorator';
import { Context } from 'egg';

@Provide()
@Controller('/api/user')
export class UserController {
  @Inject()
  ctx: Context;

  @Get('/info')
  async api() {
    return undefined;
  }
}
