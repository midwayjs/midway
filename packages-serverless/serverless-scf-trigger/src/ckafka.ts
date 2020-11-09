import { SCFBaseTrigger } from './base';
import { SCF } from '@midwayjs/faas-typings';

/**
 * https://cloud.tencent.com/document/product/583/17530
 */
export class CKafkaTrigger extends SCFBaseTrigger {
  handler;

  async toArgs() {
    const event: SCF.CKafkaEvent = {
      Records: [
        {
          Ckafka: {
            topic: 'test-topic',
            partition: 1,
            offset: 36,
            msgKey: 'None',
            msgBody: 'Hello from Ckafka!',
          },
        },
        {
          Ckafka: {
            topic: 'test-topic',
            partition: 1,
            offset: 37,
            msgKey: 'None',
            msgBody: 'Hello from Ckafka again!',
          },
        },
      ],
    };

    return [event, this.createContext()];
  }
}

export const ckafka = CKafkaTrigger;
