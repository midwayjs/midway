import {
  MIDWAY_LOGGER_WRITEABLE_DIR,
  MidwayAppInfo,
  ServiceFactoryConfigOption,
} from '../interface';
import { getCurrentEnvironment, isDevelopmentEnvironment } from '../util/';
import { join } from 'path';
import type { LoggerOptions } from '@midwayjs/logger';

export default (
  appInfo: MidwayAppInfo
): {
  midwayLogger?: ServiceFactoryConfigOption<LoggerOptions>;
  debug?: {
    recordConfigMergeOrder?: boolean;
  };
  asyncContextManager: {
    enable: boolean;
  };
} => {
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
