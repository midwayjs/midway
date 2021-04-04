import { SCFBaseTrigger } from './base';
import { SCF } from '@midwayjs/faas-typings';
import * as extend from 'extend2';
/**
 * https://cloud.tencent.com/document/product/583/9708
 */
export class TimerTrigger extends SCFBaseTrigger {
  getEvent() {
    return {
      Message: '',
      Time: '2019-11-19T03:33:00Z',
      TriggerName: 'test',
      Type: 'Timer',
    };
  }
}

export const timer = TimerTrigger;
export const createTimerEvent = (data: any = {}): SCF.TimerEvent => {
  return extend(true, new TimerTrigger().getEvent(), data);
}
