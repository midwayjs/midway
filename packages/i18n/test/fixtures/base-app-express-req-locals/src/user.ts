import { Controller, Get, Inject, Query } from '@midwayjs/core';
import { MidwayI18nService } from '../../../../src';

@Controller('/')
export class UserController {

  @Inject()
  i18nService: MidwayI18nService;

  @Inject()
  res;

  @Get('/')
  async index(@Query('username') username: string) {
    const i18n = this.res.locals['i18n'];

    return i18n('HELLO_MESSAGE', {
      username
    });
  }
}
