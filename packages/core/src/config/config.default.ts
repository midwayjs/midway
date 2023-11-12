import type { MidwayAppInfo, MidwayCoreDefaultConfig } from '../interface';
import { getCurrentEnvironment, isDevelopmentEnvironment } from '../util/';
import { join } from 'path';
import { MIDWAY_LOGGER_WRITEABLE_DIR } from '../constants';

export default (appInfo: MidwayAppInfo): MidwayCoreDefaultConfig => {
  const isDevelopment = isDevelopmentEnvironment(getCurrentEnvironment());
  const logRoot = process.env[MIDWAY_LOGGER_WRITEABLE_DIR] ?? appInfo.root;
  return {
    core: {
      healthCheckTimeout: 1000,
    },
    asyncContextManager: {
      enable: false,
    },
    midwayLogger: {
      default: {
        dir: join(logRoot, 'logs', appInfo.name),
        level: 'info',
        consoleLevel: isDevelopment ? 'info' : 'warn',
        auditFileDir: '.audit',
      },
      clients: {
        coreLogger: {
          level: isDevelopment ? 'info' : 'warn',
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
