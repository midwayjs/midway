import { FCBaseTrigger } from './base';

/**
 * https://help.aliyun.com/document_detail/62922.html
 */
export class OSSTrigger extends FCBaseTrigger {

  handler;

  async toArgs(): Promise<any []> {
    const event = {
      events: [
        {
          eventName: 'ObjectCreated:PutObject',
          eventSource: 'acs:oss',
          eventTime: '2017-04-21T12:46:37.000Z',
          eventVersion: '1.0',
          oss: {
            bucket: {
              arn: 'acs:oss:cn-shanghai:123456789:bucketname',
              name: 'testbucket',
              ownerIdentity: '123456789',
              virtualBucket: ''
            },
            object: {
              deltaSize: 122539,
              eTag: '688A7BF4F233DC9C88A80BF985AB7329',
              key: 'image/a.jpg',
              size: 122539
            },
            ossSchemaVersion: '1.0',
            ruleId: '9adac8e253828f4f7c0466d941fa3db81161e853'
          },
          region: 'cn-shanghai',
          requestParameters: {
            sourceIPAddress: '140.205.128.221'
          },
          responseElements: {
            requestId: '58F9FF2D3DF792092E12044C'
          },
          userIdentity: {
            principalId: '123456789'
          }
        }
      ]
    };

    return [event, this.createContext()];
  }

}
