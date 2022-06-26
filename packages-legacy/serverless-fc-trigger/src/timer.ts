import { FCBaseTrigger } from './base';
import { extend } from '@midwayjs/core';
import { FC } from '@midwayjs/faas-typings';
/**
 * https://help.aliyun.com/document_detail/62922.html
 */
export class TimerTrigger extends FCBaseTrigger {
  getEvent() {
    return {
      triggerTime: new Date().toJSON(),
      triggerName: 'timer',
      payload: '',
    };
  }
}
export const timer = TimerTrigger;
export const createTimerEvent = (data: any = {}): FC.TimerEvent => {
  const result = {};
  return extend(true, result, new TimerTrigger().getEvent(), data);
};
