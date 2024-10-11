import { Inject, Provide, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';
import { Plugin, MainApp } from '@midwayjs/core';
import * as assert from 'assert';

@Provide()
export class HelloService {
  @Inject()
  ctx; // context

  @MainApp()
  app;

  @Plugin()
  mysql;

  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  handler(event) {
    assert.ok(this.app);
    return this.ctx.originContext['text'] + event.text + this.mysql.model;
  }
}
