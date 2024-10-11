import { Inject, Provide, ServerlessTrigger, ServerlessTriggerType, MainApp } from '@midwayjs/core';
import { Context, Event } from '../../../../src';

@Provide()
export class HelloEventService {
  @Inject()
  ctx: Context; // context

  @MainApp()
  app;
  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  async handler(@Event() event) {
    return event;
  }

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/test_event',
  })
  async getHandler(@Event() event) {
    return event;
  }
}
