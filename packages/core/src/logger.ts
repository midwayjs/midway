import { MidwayBaseLogger, LoggerOptions } from '@midwayjs/logger';
import { IMidwayContainer, IMidwayFramework } from './interface';
import { isDevelopmentEnvironment } from './util';
import { join } from 'path';

export const createFrameworkLoggerOptions = (
  framework: IMidwayFramework<any, any>
) => {
  const isDevelopmentEnv = isDevelopmentEnvironment(
    framework.getCurrentEnvironment()
  );
  const loggerOptions: LoggerOptions = {
    label: framework.getFrameworkType(),
    dir: join(framework.getAppDir(), 'logs'),
    disableFile: isDevelopmentEnv,
    disableError: isDevelopmentEnv,
  };
  return loggerOptions;
};

export const createFrameworkConsoleLoggerOptions = (
  framework: IMidwayFramework<any, any>
) => {
  const loggerOptions: LoggerOptions = {
    label: framework.getFrameworkType(),
    dir: join(framework.getAppDir(), 'logs'),
    disableFile: true,
    disableError: true,
  };
  return loggerOptions;
};

export const createMidwayLogger = (
  container: IMidwayContainer,
  options: LoggerOptions = {}
) => {
  const isDevelopmentEnv = isDevelopmentEnvironment(
    container.getEnvironmentService().getCurrentEnvironment()
  );
  const appDir = container.get<string>('appDir');
  const loggerOptions: LoggerOptions = {
    dir: join(appDir, 'logs'),
    disableFile: isDevelopmentEnv,
    disableError: isDevelopmentEnv,
  };
  return new MidwayBaseLogger(Object.assign(loggerOptions, options));
};
