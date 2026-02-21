import { Controller, Get, Inject, Query } from '@midwayjs/core';

@Controller('/api')
export class HomeController {
  @Inject()
  app;

  @Get('/hello')
  async hello(@Query('name') name: string) {
    return `hello ${name}`;
  }
}
