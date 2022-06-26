import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType, App } from '@midwayjs/decorator';
import { FC } from '@midwayjs/faas-typings';
import * as assert from 'assert';
import { Application } from '../../../../src';

@Provide()
export class EventService {
  @Inject()
  ctx;

  @App()
  app: Application;

  @ServerlessTrigger(ServerlessTriggerType.TIMER, {
    type: 'cron',
    value: '* * * * 4',
    payload: 'test'
  })
  async handler(event: FC.TimerEvent): Promise<FC.TimerEvent> {
    assert(this.app.getInitializeContext());
    return event;
  }
}
