import { SCFBaseTrigger } from './base';
import { SCF } from '@midwayjs/faas-typings';
import { extend } from '@midwayjs/core';
/**
 * https://cloud.tencent.com/document/product/583/9708
 */
export class TimerTrigger extends SCFBaseTrigger {
  getEvent() {
    return {
      Message: '',
      Time: new Date().toJSON(),
      TriggerName: 'test',
      Type: 'Timer',
    };
  }
}

export const timer = TimerTrigger;
export const createTimerEvent = (data: any = {}): SCF.TimerEvent => {
  return extend(true, new TimerTrigger().getEvent(), data);
};
