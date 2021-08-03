import { Controller, Get, Inject, Provide } from '@midwayjs/decorator';
import { Context } from 'egg';

@Provide()
@Controller('/')
export class HomeController {

  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    return {
      data: '中间件运行结果：' + this.ctx.test,
    };
  }
}
