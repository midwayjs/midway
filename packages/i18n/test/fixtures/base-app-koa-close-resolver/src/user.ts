import { Controller, Get, Inject, Query } from '@midwayjs/decorator';
import { MidwayI18nService } from '../../../../src';

@Controller('/')
export class UserController {

  @Inject()
  i18nService: MidwayI18nService;

  @Get('/')
  async index(@Query('username') username: string) {
    return this.i18nService.translate('HELLO_MESSAGE', {
      args: {
        username
      },
    });
  }
}
