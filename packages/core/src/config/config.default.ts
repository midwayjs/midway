import type { MidwayAppInfo, MidwayCoreDefaultConfig } from '../interface';
import { getCurrentEnvironment, isDevelopmentEnvironment } from '../util/';

export default (appInfo: MidwayAppInfo): MidwayCoreDefaultConfig => {
  const isDevelopment = isDevelopmentEnvironment(getCurrentEnvironment());
  return {
    core: {
      healthCheckTimeout: 1000,
    },
    asyncContextManager: {
      enable: true,
    },
    midwayLogger: {
      default: {
        level: 'info',
      },
      clients: {
        coreLogger: {
          level: isDevelopment ? 'info' : 'warn',
        },
        appLogger: {
          aliasName: 'logger',
        },
      },
    },
    debug: {
      recordConfigMergeOrder: isDevelopment,
    },
  };
};
