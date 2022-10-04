import { Inject, Provide, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';

@Provide()
export class HelloService {
  @Inject()
  ctx; // context

  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  handler(event) {
    return this.ctx.originContext['text'] +  this.ctx.originEvent.text + this.ctx.requestId;
  }
}
