import { Provide, Controller, Get } from '@midwayjs/core';

@Provide()
@Controller('/')
export class HomeController {

  @Get('/')
  @Get('/home')
  @Get('/poster')
  async index(ctx) {
    ctx.body = 'hello';
  }

}
