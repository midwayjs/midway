import {
  Controller,
  Get,
  Provide,
} from '@midwayjs/core';

@Provide()
@Controller('/')
export class APIController {

  @Get('/abc/*')
  async home() {
    return 'hello worldabc';
  }

  @Get('/*')
  async home_abc() {
    return 'hello world';
  }

}
