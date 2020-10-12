import { Controller, Get, Inject, Plugin, Provide, } from '@midwayjs/decorator';

@Provide()
@Controller('/')
export class HomeController {
  @Plugin()
  custom: any;

  @Inject()
  ctx;

  @Get('/')
  async home() {
    return 'hello world' + this.ctx.text + this.custom['bbb'];
  }

}
