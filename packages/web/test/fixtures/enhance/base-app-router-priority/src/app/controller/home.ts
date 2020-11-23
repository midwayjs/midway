import { Provide, Controller, Get, Priority } from '@midwayjs/decorator';

@Provide()
@Priority(-1)
@Controller('/')
export class HomeController {

  @Get('/hello')
  async index(ctx) {
    ctx.body = 'hello';
  }

  @Get('/*')
  async all(ctx) {
    ctx.body = 'world';
  }

}
