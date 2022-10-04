import { Controller, Get, Provide } from '@midwayjs/core';

@Provide()
@Controller('/')
export class HomeController {
  @Get('/')
  async home(): Promise<string> {
    return 'Hello Midwayjs!';
  }
}
