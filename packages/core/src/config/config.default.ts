import type { MidwayAppInfo, MidwayCoreDefaultConfig } from '../interface';
import { getCurrentEnvironment, isDevelopmentEnvironment } from '../util/';

export default (appInfo: MidwayAppInfo): MidwayCoreDefaultConfig => {
  const isDevelopment = isDevelopmentEnvironment(getCurrentEnvironment());
  return {
    asyncContextManager: {
      enable: false,
    },
    midwayLogger: {
      default: {
        level: 'info',
      },
      clients: {
        coreLogger: {
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
