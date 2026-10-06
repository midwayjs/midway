import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return 'Hello Midway! Service 已创建，下一课将学习如何使用。';
  }

  @Get('/info')
  async info() {
    return {
      name: 'Midway.js',
      version: '4.0',
      description: '一个面向未来的 Node.js 框架',
      lesson: '第四课：创建第一个 Service'
    };
  }
}
