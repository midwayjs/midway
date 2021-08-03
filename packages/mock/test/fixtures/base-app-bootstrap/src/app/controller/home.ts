import { Controller, Get, Provide, Query } from '@midwayjs/decorator';

@Provide()
@Controller('/')
export class HomeController {

  @Get('/')
  async index(@Query('name') name) {
    return `hello world, ${name}`;
  }
}
