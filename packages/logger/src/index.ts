import { LoggerOptions } from './interface';
import { MidwayLoggerContainer } from './container';

export * from './interface';
export * from './transport';
export { EmptyLogger, MidwayBaseLogger, MidwayDelegateLogger } from './logger';
export const loggers = new MidwayLoggerContainer();
export const createLogger = (loggerId: string, options: LoggerOptions = {}) => {
  return loggers.createLogger(loggerId, options);
};

export const createConsoleLogger = (
  loggerId: string,
  options: LoggerOptions = {}
) => {
  return loggers.createLogger(
    loggerId,
    Object.assign(options, {
      disableError: true,
      disableFile: true,
    })
  );
};

export const clearAllLoggers = () => {
  loggers.close();
};
