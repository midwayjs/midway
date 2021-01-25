import { ILogger, LoggerOptions } from './interface';
import { MidwayLoggerContainer } from './container';

export { format, transports } from 'winston';
export { displayCommonMessage, displayLabels } from './format';
export * from './interface';
export * from './transport';
export { EmptyLogger, MidwayBaseLogger, MidwayDelegateLogger } from './logger';
export const loggers = new MidwayLoggerContainer();
export const createLogger = <T extends ILogger>(
  name: string,
  options: LoggerOptions = {}
): T => {
  return loggers.createLogger(name, options) as T;
};

export const createConsoleLogger = (
  name: string,
  options: LoggerOptions = {}
): ILogger => {
  return loggers.createLogger(
    name,
    Object.assign(options, {
      disableError: true,
      disableFile: true,
    })
  );
};

export const clearAllLoggers = (): void => {
  loggers.reset();
};
