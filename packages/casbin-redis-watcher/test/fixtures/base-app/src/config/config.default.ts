import { MidwayAppInfo } from '@midwayjs/core';
import { join } from 'path';
import { createAdapter } from '../../../../../src';

export default (appInfo: MidwayAppInfo) => {
  return {
    keys: '123456',
    redis: {
      clients: {
        'node-casbin-official': {
          host: '127.0.0.1',
          port: 6379,
          password: '',
          db: '0',
        }
      }
    },
    casbin: {
      modelPath: join(appInfo.appDir, 'basic_model.conf'),
      policyAdapter: createAdapter({
        clientName: 'node-casbin-official'
      }),
      usernameFromContext: (ctx) => {
        return ctx.user;
      }
    },
  };
}
