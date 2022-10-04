import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';

@Provide()
export class EventService {
  @Inject()
  ctx;

  @ServerlessTrigger(ServerlessTriggerType.HSF)
  async handleEvent() {
    return 'hello world';
  }
}
