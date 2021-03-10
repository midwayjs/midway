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
  isEnableFile(): boolean ;
  isEnableConsole(): boolean;
  isEnableError(): boolean ;
  updateLevel(level: LoggerLevel): void;
  updateFileLevel(level: LoggerLevel): void;
  updateConsoleLevel(level: LoggerLevel): void;
  updateDefaultLabel(defaultLabel: string): void;
  updateDefaultMeta(defaultMeta: object): void;
  updateInfo(customInfoHandler: (info: MidwayTransformableInfo) => any): void;
  getDefaultLabel(): string;
  getDefaultMeta(): Record<string, unknown>;
  write(...args): boolean;
  add(transport: any): any;
  remove(transport: any): any;
  close(): any;
}

export type LoggerLevel = 'silly' | 'debug' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
  format?: logform.Format;
  level?: LoggerLevel;
  defaultMeta?: object;
  printFormat?: (info: any) => string;
  dir?: string;
  errorDir?: string;
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

export interface MidwayTransformableInfo {
  [key: string]: any;
  level: string;
  timestamp: string;
  LEVEL: string;
  pid: number;
  labelText: string;
  message: string;
  ctx: any;
  ignoreFormat: boolean;
  defaultLabel: string;
  originError?: Error;
  stack?: string;
}
