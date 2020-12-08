import { MidwayBaseLogger, LoggerOptions } from '@midwayjs/logger';
import { IMidwayFramework } from './interface';
import { isDevelopmentEnvironment } from './util';

export const createFrameworkLogger = (
  framework: IMidwayFramework<any, any>
) => {
  const isDevelopmentEnv = isDevelopmentEnvironment(
    framework.getCurrentEnvironment()
  );
  const loggerOptions: LoggerOptions = {
    label: framework.getFrameworkType(),
    dir: framework.getAppDir(),
    disableFile: isDevelopmentEnv,
    disableError: isDevelopmentEnv,
  };
  return new MidwayBaseLogger(loggerOptions);
};

export const createFrameworkConsoleLogger = (
  framework: IMidwayFramework<any, any>
) => {
  const loggerOptions: LoggerOptions = {
    label: framework.getFrameworkType(),
    dir: framework.getAppDir(),
    disableFile: true,
    disableError: true,
  };
  return new MidwayBaseLogger(loggerOptions);
};
