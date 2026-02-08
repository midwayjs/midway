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
      description: 'A future-ready Node.js framework'
    };
  }

  @Get('/greet')
  async greet(@Query('name') name: string) {
    return `Hello, ${name || 'Guest'}!`;
  }

  @Get('/user/:id')
  async getUserById(@Param('id') id: string) {
    return {
      userId: id,
      name: `User ${id}`,
      email: `user${id}@example.com`
    };
  }

  @Get('/search/:category')
  async search(
    @Param('category') category: string,
    @Query('keyword') keyword: string,
    @Query('page') page: string = '1'
  ) {
    return {
      category,
      keyword,
      page: parseInt(page),
      results: []
    };
  }

  @Get('/calc/:operation')
  async calculate(
    @Param('operation') operation: string,
    @Query('a') a: string,
    @Query('b') b: string
  ) {
    const num1 = parseFloat(a);
    const num2 = parseFloat(b);

    let result: number;
    switch (operation) {
      case 'add':
        result = num1 + num2;
        break;
      case 'subtract':
        result = num1 - num2;
        break;
      case 'multiply':
        result = num1 * num2;
        break;
      case 'divide':
        result = num1 / num2;
        break;
      default:
        return { error: 'Unsupported operation' };
    }

    return {
      operation,
      a: num1,
      b: num2,
      result
    };
  }
}
