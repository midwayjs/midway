import { Controller, Provide, Get } from '@midwayjs/core';

@Provide()
@Controller()
export class HomeController {
  @Get()
  async homeAPI() {
    return 'hello world';
  }
}
