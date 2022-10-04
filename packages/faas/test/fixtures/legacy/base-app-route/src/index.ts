import { Inject, Provide, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';

@Provide()
export class HelloService {

  @Inject()
  ctx;  // context

  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  handler(event) {
    return event.text + this.ctx.text;
  }
}
