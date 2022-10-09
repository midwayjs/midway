import { MidwayAppInfo } from '@midwayjs/core';
import { join } from 'path';
import { CasbinRule, createAdapter } from '../../../../../src';

export default (appInfo: MidwayAppInfo) => {
  return {
    keys: '123456',
    typeorm: {
      dataSource: {
        'node-casbin-official': {
          type: 'sqlite',
          synchronize: true,
          database: join(__dirname, '../../casbin.sqlite'),
          logging: true,
          entities: [CasbinRule],
        }
      }
    },
    casbin: {
      modelPath: join(appInfo.appDir, 'basic_model.conf'),
      policyAdapter: createAdapter({
        dataSourceName: 'node-casbin-official'
      }),
      usernameFromContext: (ctx) => {
        return ctx.user;
      }
    }
  };
}
