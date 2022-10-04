import { Controller, Get, Provide } from '@midwayjs/core';

@Provide()
@Controller('/')
export class HomeController {
  @Get('/')
  async homeIndex() {
    return 'hello world';
  }
}
