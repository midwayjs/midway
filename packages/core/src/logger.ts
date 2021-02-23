import { createLogger, LoggerOptions } from '@midwayjs/logger';
import { IMidwayFramework } from './interface';
import { isDevelopmentEnvironment, getUserHome } from './util';
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
    dir: isDevelopmentEnv
      ? join(framework.getAppDir(), 'logs', framework.getProjectName())
      : join(getUserHome(), 'logs', framework.getProjectName()),
    level: isDevelopmentEnv ? 'info' : 'warn',
  };
  return createLogger(name, Object.assign({}, loggerOptions, options));
};
