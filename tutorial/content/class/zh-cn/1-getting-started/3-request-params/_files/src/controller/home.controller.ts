import { Controller, Get, Query, Param } from '@midwayjs/core';

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

  @Get('/greet')
  async greet(@Query('name') name: string) {
    return `你好, ${name || '游客'}!`;
  }

  @Get('/user/:id')
  async getUserById(@Param('id') id: string) {
    return {
      userId: id,
      name: `用户${id}`,
      email: `user${id}@example.com`,
    };
  }
}
