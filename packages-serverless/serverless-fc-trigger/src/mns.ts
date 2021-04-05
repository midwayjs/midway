import { FCBaseTrigger } from './base';
import * as extend from 'extend2';
import { FC } from '@midwayjs/faas-typings';
/**
 * https://help.aliyun.com/document_detail/100092.html
 */
export class MNSTrigger extends FCBaseTrigger {
  getEvent() {
    return {
      Context: 'user custom info',
      TopicOwner: '1186202104331798',
      Message: 'hello topic',
      Subscriber: '1186202104331798',
      PublishTime: 1550216302888,
      SubscriptionName: 'test-fc-subscibe',
      MessageMD5: 'BA4BA9B48AC81F0F9C66F6C909C39DBB',
      TopicName: 'test-topic',
      MessageId: '2F5B3C281B283D4EAC694B7425288675',
    };
  }
}

export const mq = MNSTrigger;
export const createMNSEvent = (data: any = {}): FC.MNSEvent => {
  return extend(true, new MNSTrigger().getEvent(), data);
};
