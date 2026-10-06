import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return 'Hello Midwayjs!';
  }

  @Get('/info')
  async info() {
    return {
      name: 'Midway.js',
      version: '4.0',
    };
  }
}
