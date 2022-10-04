import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType, App } from '@midwayjs/core';
import { Application } from '../../../../src';

@Provide()
export class EventService {
  @Inject()
  ctx;

  @App()
  app: Application;

  @ServerlessTrigger(ServerlessTriggerType.HSF)
  async handler() {
   return 'test'
  }
}
