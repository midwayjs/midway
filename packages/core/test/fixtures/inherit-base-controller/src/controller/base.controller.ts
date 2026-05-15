import { Get, Post, Body, Query } from '../../../../../src';

export abstract class BaseController {
  @Get('/list')
  async list(@Query() query: any) {
    return { query };
  }

  @Post('/add')
  async add(@Body() body: any) {
    return { body };
  }

  @Post('/del')
  async del(@Body() body: any) {
    return { body };
  }

  @Post('/update')
  async update(@Body() body: any) {
    return { body };
  }
}

