import { Inject, Provide, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';

@Provide()
export class HelloService {
  @Inject()
  ctx: any; // context

  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  async handler(event) {
    return 'hello event' + this.ctx.getAttr('result') + event.text;
  }

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/test',
    method: 'get'
  })
  async http_handler() {
    return 'hello http' + this.ctx.getAttr('result');
  }
}
