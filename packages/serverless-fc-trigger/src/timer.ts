import { FCBaseTrigger } from './base';

/**
 * https://help.aliyun.com/document_detail/62922.html
 */
export class TimerTrigger extends FCBaseTrigger {

  handler;

  async toArgs(): Promise<any []> {
    const event = {
      triggerTime: '2019-12-01T16:00:00Z',
      triggerName: 'timer',
      payload: ''
    };
    return [event, this.createContext()];
  }

}
export const timer = TimerTrigger;
