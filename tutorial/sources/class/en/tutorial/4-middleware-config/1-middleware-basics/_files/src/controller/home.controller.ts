import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return {
      message: 'Middleware lesson: visit /middleware-demo to see logs',
    };
  }

  @Get('/middleware-demo')
  async middlewareDemo() {
    return {
      success: true,
      lesson: 'middleware-basics',
      timestamp: Date.now(),
    };
  }
}
