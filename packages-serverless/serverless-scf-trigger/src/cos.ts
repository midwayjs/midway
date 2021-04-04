import { SCFBaseTrigger } from './base';
import { SCF } from '@midwayjs/faas-typings';
import * as extend from 'extend2';
/**
 * https://cloud.tencent.com/document/product/583/9707
 */
export class COSTrigger extends SCFBaseTrigger {
  getEvent() {
    return {
      Records: [
        {
          cos: {
            cosSchemaVersion: '1.0',
            cosObject: {
              url:
                'http://testpic-1253970026.cos.ap-chengdu.myqcloud.com/testfile',
              meta: {
                'x-cos-request-id': 'NWMxOWY4MGFfMjViMjU4NjRfMTUyMV8yNzhhZjM=',
                'Content-Type': '',
              },
              vid: '',
              key: '/1253970026/testpic/testfile',
              size: 1029,
            },
            cosBucket: {
              region: 'cd',
              name: 'testpic',
              appid: '1253970026',
            },
            cosNotificationId: 'unkown',
          },
          event: {
            eventName: 'cos:ObjectCreated:*',
            eventVersion: '1.0',
            eventTime: 1545205770,
            eventSource: 'qcs::cos',
            requestParameters: {
              requestSourceIP: '192.168.15.101',
              requestHeaders: {
                Authorization:
                  'q-sign-algorithm=sha1&q-ak=AKIDQm6iUh2NJ6jL41tVUis9KpY5Rgv49zyC&q-sign-time=1545205709;1545215769&q-key-time=1545205709;1545215769&q-header-list=host;x-cos-storage-class&q-url-param-list=&q-signature=098ac7dfe9cf21116f946c4b4c29001c2b449b14',
              },
            },
            eventQueue:
              'qcs:0:lambda:cd:appid/1253970026:default.printevent.$LATEST',
            reservedInfo: '',
            reqid: 179398952,
          },
        },
      ],
    };
  }
}

export const os = COSTrigger;
export const cos = COSTrigger;
export const oss = COSTrigger;
export const createCOSEvent = (data: any = {}): SCF.COSEvent => {
  return extend(true, new COSTrigger().getEvent(), data);
}
