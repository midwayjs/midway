import { Config, Controller, Get, Provide } from '@midwayjs/core';

@Provide()
@Controller('/')
export class HomeController {
  @Config()
  mock;

  @Get()
  async home() {
    return 'hello world' + this.mock.bbb;
  }
}
