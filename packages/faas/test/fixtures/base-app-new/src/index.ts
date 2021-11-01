import { Inject, Provide, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';

@Provide()
export class HelloService {
  @Inject()
  ctx: any; // context

  @ServerlessTrigger(ServerlessTriggerType.EVENT, { middleware: ['auth']})
  async handler(event) {
    return event.text + this.ctx.text + this.ctx.extraData;
  }
}
