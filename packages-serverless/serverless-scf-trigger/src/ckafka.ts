import { SCFBaseTrigger } from './base';
import * as extend from 'extend2';
import { SCF } from '@midwayjs/faas-typings';

/**
 * https://cloud.tencent.com/document/product/583/17530
 */
export class CKafkaTrigger extends SCFBaseTrigger {
  getEvent() {
    return {
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
  }
}

export const ckafka = CKafkaTrigger;
export const createCKafkaEvent = (data: any = {}): SCF.CKafkaEvent => {
  return extend(true, new CKafkaTrigger().getEvent(), data);
};
