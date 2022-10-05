import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core';

@Controller('/')
export class APIController {

  @Inject()
  ctx: any;

  @Get('/')
  async home() {
    return 'hello world';
  }
}
