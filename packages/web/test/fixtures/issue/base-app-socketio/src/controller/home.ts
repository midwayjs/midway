import { Controller, Get, Provide } from '@midwayjs/core';

@Provide()
@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return 'Hello Midwayjs!';
  }
}
