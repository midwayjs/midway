import { Inject, Provide, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';

@Provide()
export class HelloService {
  @Inject()
  ctx: any; // context

  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  async handler() {
    return 'hello event' + this.ctx.getAttr('result');
  }

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/test',
    method: 'get'
  })
  async http_handler() {
    return 'hello http' + this.ctx.getAttr('result');
  }
}
