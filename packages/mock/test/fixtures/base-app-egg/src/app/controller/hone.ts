import { Controller, Get, Provide, Query } from '@midwayjs/core';

@Provide()
@Controller('/')
export class HomeController {

  @Get()
  async index(@Query('name') name) {
    return `hello world, ${name}`;
  }
}
