import { LoggerOptions } from './interface';
import { MidwayLoggerContainer } from './container';

export * from './interface';
export * from './transport';
export { EmptyLogger, MidwayBaseLogger, MidwayDelegateLogger } from './logger';
export const loggers = new MidwayLoggerContainer();
export const createLogger = (name: string, options: LoggerOptions = {}) => {
  return loggers.createLogger(name, options);
};

export const createConsoleLogger = (
  name: string,
  options: LoggerOptions = {}
) => {
  return loggers.createLogger(
    name,
    Object.assign(options, {
      disableError: true,
      disableFile: true,
    })
  );
};

export const clearAllLoggers = () => {
  loggers.close();
};
