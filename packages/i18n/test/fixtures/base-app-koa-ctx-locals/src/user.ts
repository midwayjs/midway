import { Controller, Get, Inject, Query } from '@midwayjs/core';

@Controller('/')
export class UserController {

  @Inject()
  ctx;

  @Get('/')
  async index(@Query('username') username: string) {
    const i18n = this.ctx.locals['i18n'];

    return i18n('HELLO_MESSAGE', {
      username
    });
  }
}
