import { SCFBaseTrigger } from './base';
import { SCF } from '@midwayjs/faas-typings';
import * as extend from 'extend2';

/**
 * https://cloud.tencent.com/document/product/583/11517
 */
export class CMQTrigger extends SCFBaseTrigger {
  getEvent() {
    return {
      Records: [
        {
          CMQ: {
            type: 'topic',
            topicOwner: 1567,
            topicName: 'testtopic',
            subscriptionName: 'xxxxxx',
            publishTime: '1970-01-01T00:00:00.000Z',
            msgId: '123345346',
            requestId: '123345346',
            msgBody: 'Hello from CMQ!',
            msgTag: 'tag1,tag2',
          },
        },
      ],
    };
  }
}

export const mq = CMQTrigger;
export const cmq = CMQTrigger;
export const createCMQEvent = (data: any = {}): SCF.CMQEvent => {
  return extend(true, new CMQTrigger().getEvent(), data);
}
