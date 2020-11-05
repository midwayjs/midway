import { SCFBaseTrigger } from './base';
import { SCF } from '@midwayjs/faas-typings';

/**
 * https://cloud.tencent.com/document/product/583/11517
 */
export class CMQTrigger extends SCFBaseTrigger {
  handler;

  async toArgs() {
    const event: SCF.CMQEvent = {
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

    return [event, this.createContext()];
  }
}

export const mq = CMQTrigger;
export const cmq = CMQTrigger;
