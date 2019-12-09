import { SCFBaseTrigger } from './base';
import { CKafkaEvent } from '@midwayjs/serverless-scf-starter';

/**
 * https://cloud.tencent.com/document/product/583/17530
 */
export class CKafkaTrigger extends SCFBaseTrigger {
  handler;

  async toArgs() {
    const event: CKafkaEvent = {
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
