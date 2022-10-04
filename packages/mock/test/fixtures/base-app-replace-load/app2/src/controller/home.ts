import { Controller, Get, Provide } from '@midwayjs/core';

@Provide()
@Controller('/')
export class HomeController {

  @Get()
  async index() {
    return 'hello world 2222';
  }
}
