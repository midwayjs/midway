import { Provide, Controller, Get, Inject } from '@midwayjs/decorator';

@Provide()
@Controller('/circular')
export class CircularController {
  @Inject()
  planA: any;

  @Get('/test')
  async test(ctx) {
    ctx.body = 'success';
  }
}
