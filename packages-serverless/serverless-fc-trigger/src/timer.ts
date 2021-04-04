import { FCBaseTrigger } from './base';
import * as extend from 'extend2';
import { FC } from '@midwayjs/faas-typings';
/**
 * https://help.aliyun.com/document_detail/62922.html
 */
export class TimerTrigger extends FCBaseTrigger {
  getEvent() {
    return {
      triggerTime: '2019-12-01T16:00:00Z',
      triggerName: 'timer',
      payload: '',
    };
  }
}
export const timer = TimerTrigger;
export const createTimerEvent = (data: any = {}): FC.TimerEvent => {
  const result = {};
  return extend(true, result, new TimerTrigger().getEvent(), data);
}
