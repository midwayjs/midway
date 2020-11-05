import { FCBaseTrigger } from './base';

/**
 * https://help.aliyun.com/document_detail/84092.html
 */
export class SLSTrigger extends FCBaseTrigger {
  handler;

  async toArgs(): Promise<any[]> {
    const event = {
      parameter: {},
      source: {
        endpoint: 'http://cn-shanghai-intranet.log.aliyuncs.com',
        projectName: 'log-com',
        logstoreName: 'log-en',
        shardId: 0,
        beginCursor: 'MTUyOTQ4MDIwOTY1NTk3ODQ2Mw==',
        endCursor: 'MTUyOTQ4MDIwOTY1NTk3ODQ2NA==',
      },
      jobName: '1f7043ced683de1a4e3d8d70b5a412843d817a39',
      taskId: 'c2691505-38da-4d1b-998a-f1d4bb8c9994',
      cursorTime: 1529486425,
    };

    return [event, this.createContext()];
  }
}

export const sls = SLSTrigger;
