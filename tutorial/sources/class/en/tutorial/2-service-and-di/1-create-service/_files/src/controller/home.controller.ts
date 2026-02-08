import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return 'Hello Midway! Service is ready. Next lesson: how to use it.';
  }

  @Get('/info')
  async info() {
    return {
      name: 'Midway.js',
      version: '4.0',
      description: 'A future-ready Node.js framework',
      lesson: 'Lesson 4: Create Your First Service'
    };
  }
}
