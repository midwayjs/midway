import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType, Query } from '@midwayjs/core';

@Provide()
export class EventService {
  @Inject()
  ctx;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/event',
    method: 'get',
  })
  async handleEvent(@Query('name') name: string) {
    return 'hello world, ' + name;
  }
}
