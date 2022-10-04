import { Provide, Controller, Get } from '@midwayjs/core';

@Provide()
@Controller('/')
class My {
  @Get('/')
  async index(ctx) {
    ctx.body = 'root_test';
  }
}
export = My;
