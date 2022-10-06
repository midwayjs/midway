import {
  Controller,
  Post,
  Inject,
  Body,
  Get,
} from '@midwayjs/core';
import { Context } from '../../../../../src';

class DataDTO {
  name: string;
  age: number;
}

@Controller('/api')
export class APIController {

  @Inject()
  ctx: Context;

  @Post()
  async postData(@Body() data: DataDTO) {
    return data;
  }
}

@Controller()
export class HomeController {
  @Get()
  async index() {
    return 'hello world';
  }
}
