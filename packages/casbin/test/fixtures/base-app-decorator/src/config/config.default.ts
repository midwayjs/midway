import { MidwayAppInfo } from '@midwayjs/core';
import { join } from 'path';

export default (appInfo: MidwayAppInfo) => {
  return {
    keys: '123456',
    casbin: {
      modelPath: join(appInfo.appDir, 'basic_model.conf'),
      policyAdapter: join(appInfo.appDir, 'basic_policy.csv'),
      usernameFromContext: (ctx) => {
        return ctx.user;
      }
    }
  };
}
