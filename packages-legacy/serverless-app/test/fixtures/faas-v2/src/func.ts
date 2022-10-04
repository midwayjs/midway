import {
  Get,
  Body,
  Inject,
  Provide,
  Query,
  ServerlessTrigger,
  ServerlessTriggerType,
  Headers
} from '@midwayjs/core';

@Provide()
export class FuncService {

  @Inject()
  ctx;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    method: 'get',
    path: '/func/http/get'
  })
  async handler(@Query('name') name) {
    return 'user:' + name;
  }

  @ServerlessTrigger(ServerlessTriggerType.API_GATEWAY, {
    method: 'post',
    path: '/func/http/post'
  })
  async handler2(@Body('name') name, @Headers('content-type') type) {
    return 'user:' + name;
  }

  @Get('/:test')
  async test() {
    return this.ctx.params.test;
  }
}
