export interface ILogger {
  log?(msg: any, ...args: any[]): void;
  info(msg: any, ...args: any[]): void;
  debug(msg: any, ...args: any[]): void;
  error(msg: any, ...args: any[]): void;
  warn(msg: any, ...args: any[]): void;
}

export interface IMidwayLogger extends ILogger {
  disableConsole();
  enableConsole();
  disableFile();
  enableFile();
  disableError();
  enableError();
  updateLevel(level: LoggerLevel);
}

export type LoggerLevel = 'silly' | 'debug' | 'verbose' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
  dir?: string;
  fileLogName?: string;
  errorLogName?: string;
  label?: string;
  disableConsole?: boolean;
  disableFile?: boolean;
  disableError?: boolean;
  consoleLevel?: LoggerLevel;
  fileLevel?: LoggerLevel;
  fileMaxSize?: string;
  fileMaxFiles?: string;
  errMaxSize?: string;
  errMaxFiles?: string;
}

export interface DelegateLoggerOptions {
  delegateLogger: ILogger;
}
