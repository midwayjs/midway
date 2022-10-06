import type { MidwayAppInfo, MidwayCoreDefaultConfig } from '../interface';
import { getCurrentEnvironment, isDevelopmentEnvironment } from '../util/';
import { join } from 'path';
import { MIDWAY_LOGGER_WRITEABLE_DIR } from '../constants';

export default (appInfo: MidwayAppInfo): MidwayCoreDefaultConfig => {
  const isDevelopment = isDevelopmentEnvironment(getCurrentEnvironment());
  const logRoot = process.env[MIDWAY_LOGGER_WRITEABLE_DIR] ?? appInfo.root;
  return {
    asyncContextManager: {
      enable: false,
    },
    midwayLogger: {
      default: {
        dir: join(logRoot, 'logs', appInfo.name),
        level: isDevelopment ? 'info' : 'warn',
        consoleLevel: isDevelopment ? 'info' : 'warn',
        auditFileDir: '.audit',
      },
      clients: {
        coreLogger: {
          fileLogName: 'midway-core.log',
        },
        appLogger: {
          fileLogName: 'midway-app.log',
          aliasName: 'logger',
        },
      },
    },
    debug: {
      recordConfigMergeOrder: isDevelopment,
    },
  };
};
