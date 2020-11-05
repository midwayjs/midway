import { SCFBaseTrigger } from './base';
import { SCF } from '@midwayjs/faas-typings';

/**
 * https://cloud.tencent.com/document/product/583/9708
 */
export class TimerTrigger extends SCFBaseTrigger {
  handler;

  async toArgs() {
    const event: SCF.TimerEvent = {
      Message: '',
      Time: '2019-11-19T03:33:00Z',
      TriggerName: 'test',
      Type: 'Timer',
    };
    return [event, this.createContext()];
  }
}

export const timer = TimerTrigger;
