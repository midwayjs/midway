import { Inject, Provide, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';

@Provide()
export class IndexService {
  @Inject()
  ctx; // context

  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  handler(event) {
    return event.text + this.ctx.text;
  }

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/list',
  })
  getList(event) {
    return event.text + this.ctx.text;
  }
}
