import { Controller, Get, Query } from '@midwayjs/decorator';

@Controller('/')
export class HomeController {

  @Get('/')
  async index(@Query('name') name) {
    return `hello world, ${name}`;
  }
}
