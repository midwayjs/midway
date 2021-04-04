import { BaseTrigger } from '@midwayjs/runtime-mock';
import { SCF } from '@midwayjs/faas-typings';
import * as extend from 'extend2';

export class SCFBaseTrigger extends BaseTrigger {
  useCallback = true;
  triggerOptions: any;

  constructor(triggerOptions = {}) {
    super();
    this.triggerOptions = triggerOptions;
  }

  createContext(): SCF.RequestContext {
    return {
      callbackWaitsForEmptyEventLoop: true,
      memory_limit_in_mb: 128,
      time_limit_in_ms: 3000,
      request_id: '201cb979-17d4-11ea-97b2-5254005dc76e',
      environ:
        'TENCENTCLOUD_SECRETID=12345;TENCENTCLOUD_SECRETKEY=54321;TENCENTCLOUD_SESSIONTOKEN=1234554321;SCF_NAMESPACE=default',
      function_version: '$LATEST',
      function_name: 'hellotest',
      namespace: 'default',
    };
  }
}

export const createInitializeContext = (ctx: any = {}): SCF.RequestContext => {
  return extend(true, new SCFBaseTrigger().createContext(), ctx);
}
