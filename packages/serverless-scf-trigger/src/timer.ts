import { SCFBaseTrigger } from './base';
import { SCFTimerEvent } from '@midwayjs/serverless-scf-starter';

/**
 * https://cloud.tencent.com/document/product/583/9708
 */
export class TimerTrigger extends SCFBaseTrigger {
  handler;

  async toArgs() {
    const event: SCFTimerEvent = {
      Message: '',
      Time: '2019-11-19T03:33:00Z',
      TriggerName: 'test',
      Type: 'Timer',
    };
    return [event, this.createContext()];
  }
}
