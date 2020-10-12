import { Controller, Get, Plugin, Provide, } from '@midwayjs/decorator';

@Provide()
@Controller('/')
export class HomeController {
  @Plugin()
  custom: any;

  @Get('/')
  async home() {
    console.log(this.custom);
    return 'hello world';
  }

}
