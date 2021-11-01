import { Inject, Provide, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';
import { Plugin, App } from '@midwayjs/decorator';
import * as assert from 'assert';

@Provide()
export class HelloService {
  @Inject()
  ctx; // context

  @App()
  app;

  @Plugin()
  mysql;

  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  handler(event) {
    assert(this.app);
    return this.ctx.originContext['text'] + event.text + this.mysql.model;
  }
}
