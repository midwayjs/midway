import { Inject, Controller, Get, Provide, Query } from '@midwayjs/core';

@Provide()
@Controller('/')
export class HomeController {

  @Inject()
  ctx;

  @Get()
  async index(@Query('name') name) {
    return `hello world, ${name}`;
  }

  @Get('/mock')
  async mock() {
    return {
      abc: this.ctx.abc,
      header: this.ctx.headers['x-bbb'],
      session: this.ctx.session['ccc'],
    }
  }
}
