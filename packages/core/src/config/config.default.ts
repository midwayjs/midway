import {
  MIDWAY_LOGGER_WRITEABLE_DIR,
  MidwayAppInfo,
  ServiceFactoryConfigOption,
} from '../interface';
import { getCurrentEnvironment, isDevelopmentEnvironment } from '../util/';
import { join } from 'path';
import type { LoggerOptions } from '@midwayjs/logger';

interface i18nOptions {
  defaultLanguage: string;
  languageTable: Record<string, Record<string, any>>;
  fallbackLanguage: string;
  fallback: Record<string, any>;
}

export default (
  appInfo: MidwayAppInfo
): {
  midwayLogger?: ServiceFactoryConfigOption<LoggerOptions>;
  i18n?: Partial<i18nOptions>;
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
      defaultLanguage: 'en_US',
      languageTable: {
        en_US: {},
      },
      fallbackLanguage: 'en_US',
      fallback: {
        //   'en_*': 'en_US',
        //   pt: 'pt-BR',
      },
    },
  };
};
