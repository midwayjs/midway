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
  i18n?: {
    currentLocale?: string;
  };
} => {
  const isDevelopment = isDevelopmentEnvironment(getCurrentEnvironment());
  return {
    midwayLogger: {
      default: {
        dir: join(
          process.env[MIDWAY_LOGGER_WRITEABLE_DIR] ?? appInfo.root,
          'logs',
          appInfo.name
        ),
        level: isDevelopment ? 'info' : 'warn',
        consoleLevel: isDevelopment ? 'info' : 'warn',
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
    i18n: {
      currentLocale: 'en',
    },
  };
};
