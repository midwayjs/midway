// home controller
import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {

  @Get('/')
  async index() {
    return 'Hello World';
  }
}
