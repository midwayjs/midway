import * as logform from 'logform';

export interface ILogger {
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
  updateDefaultLabel(defaultLabel: string);
  updateDefaultMeta(defaultMeta: object);
  getDefaultLabel(): string;
  getDefaultMeta(): object;
}

export type LoggerLevel = 'silly' | 'debug' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
  format?: logform.Format;
  level?: string;
  defaultMeta?: object;
  printFormat?: (info: any) => string;
  dir?: string;
  fileLogName?: string;
  errorLogName?: string;
  defaultLabel?: string;
  disableConsole?: boolean;
  disableFile?: boolean;
  disableError?: boolean;
  disableFileSymlink?: boolean;
  disableErrorSymlink?: boolean;
  consoleLevel?: LoggerLevel;
  fileLevel?: LoggerLevel;
  fileMaxSize?: string;
  fileMaxFiles?: number | string;
  errMaxSize?: string;
  errMaxFiles?: string;
}

export interface DelegateLoggerOptions {
  delegateLogger: ILogger;
}
