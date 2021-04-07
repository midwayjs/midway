import { Get, Body, Inject, Provide, Query, ServerlessTrigger, ServerlessTriggerType, ALL } from '@midwayjs/decorator';

@Provide()
export class FuncService {

  @Inject()
  ctx;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    method: 'get',
    path: '/func/http/get'
  })
  async handler(@Query() name) {
    return 'user:' + name;
  }

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    method: 'post',
    path: '/func/http/post'
  })
  async handler2(@Body() name) {
    return 'user:' + name;
  }

  @Get('/:test')
  async test() {
    return this.ctx.params.test;
  }
}
