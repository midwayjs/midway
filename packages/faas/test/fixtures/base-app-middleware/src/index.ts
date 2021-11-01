import { Inject, Provide, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';
import { App } from '@midwayjs/decorator';

@Provide()
export class HelloService {
  @Inject()
  ctx; // context

  @App()
  app;

  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  handler(event) {
    return this.ctx.originContext['text'] + event.text + this.ctx.requestId + this.app.getFunctionName() + this.app.getFunctionServiceName();
  }
}
