import { Inject, Provide, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';
import { App } from '@midwayjs/core';
import { Context } from '../../../../../src';

@Provide()
export class HelloService {
  @Inject()
  ctx: Context; // context

  @MainApp()
  app;

  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  handler() {
    return this.ctx.originContext['text'] + this.ctx.originEvent.text + (this.ctx as any).requestId + this.app.getFunctionName() + this.app.getFunctionServiceName();
  }
}
