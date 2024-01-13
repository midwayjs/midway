import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/*')
  async test() {
    this.log('begin');
    await new Promise(resolve => {
      setTimeout(resolve, 1234);
    });
    this.log('end');
    return {
      test: 123,
      name: await this.name(),
      first: await this.firstName(),
    };
  }

  async name() {
    return 'name';
  }

  async firstName() {
    await new Promise(resolve => {
      setTimeout(resolve, 1234);
    });
    return 'test';
  }

  async log(content) {
    await new Promise(resolve => {
      setTimeout(resolve, 2345);
    });
    return 'log ' + content;
  }
}
