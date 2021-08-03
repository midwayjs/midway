import { createLogger, LoggerOptions } from '@midwayjs/logger';
import { IMidwayFramework, MIDWAY_LOGGER_WRITEABLE_DIR } from './interface';
import { isDevelopmentEnvironment } from './util';
import { join } from 'path';

export const createMidwayLogger = (
  framework: IMidwayFramework<any, any>,
  name: string,
  options: LoggerOptions = {}
) => {
  const isDevelopmentEnv = isDevelopmentEnvironment(
    framework.getCurrentEnvironment()
  );
  const loggerOptions: LoggerOptions = {
    dir: join(
      framework.getApplicationContext().getInformationService().getRoot(),
      'logs',
      framework.getProjectName()
    ),
    level: isDevelopmentEnv ? 'info' : 'warn',
  };
  if (process.env[MIDWAY_LOGGER_WRITEABLE_DIR]) {
    loggerOptions.dir = join(
      process.env[MIDWAY_LOGGER_WRITEABLE_DIR],
      'logs',
      framework.getProjectName()
    );
  }
  return createLogger(name, Object.assign({}, loggerOptions, options));
};
