import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return {
      message: '中间件课程：访问 /middleware-demo 查看日志输出',
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
