import { Provide, Controller, Get } from '@midwayjs/decorator';

@Provide()
@Controller('/')
class My {
  @Get('/')
  async index(ctx) {
    ctx.body = 'root_test';
  }
}
export = My;
