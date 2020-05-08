import { FCBaseTrigger } from './base';

/**
 * https://help.aliyun.com/document_detail/62922.html
 */
export class CDNTrigger extends FCBaseTrigger {
  handler;

  async toArgs(): Promise<any[]> {
    const event = {
      events: [
        {
          eventName: 'LogFileCreated',
          eventSource: 'cdn',
          region: 'cn-hangzhou',
          eventVersion: '1.0.0',
          eventTime: 'xxxxx',
          userIdentity: {
            aliUid: '1xxxxxxxxxxxx',
          },
          resource: {
            domain: 'example.com',
          },
          eventParameter: {
            domain: 'example.com',
            endTime: 1000000,
            fileSize: 1788115,
            filePath:
              'http://cdnlog.cn-hangzhou.oss.aliyun-inc.com/xxx/xxx/xxx.gz?OSSAccessKeyId=xxxx&Expires=xxxx&Signature=xxxx',
            startTime: 11000000,
          },
          traceId: 'xxxxxx',
        },
      ],
    };

    return [event, this.createContext()];
  }
}

export const cdn = CDNTrigger;
