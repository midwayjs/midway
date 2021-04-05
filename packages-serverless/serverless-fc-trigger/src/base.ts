import { BaseTrigger } from '@midwayjs/runtime-mock';
import * as extend from 'extend2';
import { FC } from '@midwayjs/faas-typings';

export class FCBaseTrigger extends BaseTrigger {
  useCallback = true;
  triggerOptions: any;

  constructor(triggerOptions = {}) {
    super();
    this.triggerOptions = triggerOptions;
  }

  createContext() {
    return {
      requestId: 'b1c5100f-819d-c421-3a5e-7782a27d8a33',
      credentials: {
        accessKeyId: 'STS.access_key_id',
        accessKeySecret: 'access_key_secret',
        securityToken: 'security_token',
      },
      function: {
        name: 'my-func',
        handler: 'index.handler',
        memory: 128,
        timeout: 10,
        initializer: 'index.initializer',
        initializationTimeout: 10,
      },
      service: {
        name: 'my-service',
        logProject: 'my-log-project',
        logStore: 'my-log-store',
        qualifier: 'qualifier',
        versionId: '1',
      },
      region: 'cn-shanghai',
      accountId: '123456',
    };
  }

  getEvent() {
    return this.triggerOptions;
  }
}

export const event = FCBaseTrigger;
export const createInitializeContext = (
  ctx: any = {}
): FC.InitializeContext => {
  return extend(true, new FCBaseTrigger().createContext(), ctx);
};
