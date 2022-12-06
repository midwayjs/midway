import { Controller, Get, Inject } from '@midwayjs/core';

@Controller('/a')
export class HomeController {
  @Inject()
  ctx;

  @Get('/')
  async hello() {
    return 'hello a';
  }
}
