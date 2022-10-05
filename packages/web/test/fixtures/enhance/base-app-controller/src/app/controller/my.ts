import { Controller, Get, Provide } from '@midwayjs/core';

@Provide()
@Controller('/')
export class My {
  @Get('/')
  async index(ctx) {
    ctx.body = 'root_test';
  }
}
