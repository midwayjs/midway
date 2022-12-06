import { Controller, Get, Inject } from '@midwayjs/core';

@Controller('/b')
export class HomeController {
  @Inject()
  ctx;

  @Get('/')
  async hello() {
    return 'hello b';
  }
}
