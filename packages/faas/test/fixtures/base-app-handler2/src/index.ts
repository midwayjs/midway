import { Inject, Provide, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';

@Provide()
export class IndexService {
  @Inject()
  ctx; // context

  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  handler(event) {
    return 'default' + event.text + this.ctx.text;
  }

  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  getList(event) {
    return event.text + this.ctx.text;
  }

  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  get(event) {
    return 'hello';
  }
}
