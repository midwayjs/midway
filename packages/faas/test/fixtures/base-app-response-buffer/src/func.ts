import { Inject, Provide, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';
import { App } from '@midwayjs/core';
import { Context, Event } from '../../../../src';

@Provide()
export class HelloEventService {
  @Inject()
  ctx: Context; // context

  @MainApp()
  app;
  @ServerlessTrigger(ServerlessTriggerType.SSR)
  async handler(@Event() event) {
    return Buffer.from(event.text + 'hello world');
  }
}
