import { Controller, Get, Query } from '@midwayjs/core';

@Controller('/api')
export class HomeController {
  @Get('/hello')
  async hello(@Query('name') name: string) {
    return `hello ${name}`;
  }
}
