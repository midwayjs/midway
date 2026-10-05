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

  @Get('/calc/:operation')
  async calculate(
    @Param('operation') operation: string,
    @Query('a') a: string,
    @Query('b') b: string
  ) {
    const num1 = Number(a);
    const num2 = Number(b);
    const ops: Record<string, (x: number, y: number) => number> = {
      add: (x, y) => x + y,
      subtract: (x, y) => x - y,
      multiply: (x, y) => x * y,
      divide: (x, y) => y === 0 ? NaN : x / y,
    };
    const run = ops[operation];
    if (!run) {
      return { error: '不支持的操作' };
    }
    return { operation, a: num1, b: num2, result: run(num1, num2) };
  }
}
