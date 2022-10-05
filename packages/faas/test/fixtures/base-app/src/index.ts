import { Inject, Provide, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';

@Provide()
export class HelloService {

  @Inject()
  ctx;

  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  async handler(event) {
    return event.text + this.ctx.text;
  }
}
