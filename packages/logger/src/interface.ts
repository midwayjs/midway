import * as logform from 'logform';
import TransportStream = require('winston-transport');

export interface ILogger {
  info(msg: any, ...args: any[]): void;
  debug(msg: any, ...args: any[]): void;
  error(msg: any, ...args: any[]): void;
  warn(msg: any, ...args: any[]): void;
}

export type LoggerCustomInfoHandler = (
  info: MidwayTransformableInfo
) => MidwayTransformableInfo;

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
  getConsoleLevel(): LoggerLevel;
  getFileLevel(): LoggerLevel;
  updateLevel(level: LoggerLevel): void;
  updateFileLevel(level: LoggerLevel): void;
  updateConsoleLevel(level: LoggerLevel): void;
  updateDefaultLabel(defaultLabel: string): void;
  updateDefaultMeta(defaultMeta: object): void;
  updateTransformableInfo(customInfoHandler: LoggerCustomInfoHandler): void;
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
  eol?: string;
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

export interface GeneralDailyRotateFileTransportOptions extends TransportStream.TransportStreamOptions {
  json?: boolean;
  eol?: string;

  /**
   * A string representing the moment.js date format to be used for rotating. The meta characters used in this string will dictate the frequency of the file rotation. For example, if your datePattern is simply 'HH' you will end up with 24 log files that are picked up and appended to every day. (default 'YYYY-MM-DD')
   */
  datePattern?: string;

  /**
   * A boolean to define whether or not to gzip archived log files. (default 'false')
   */
  zippedArchive?: boolean;

  /**
   * Filename to be used to log to. This filename can include the %DATE% placeholder which will include the formatted datePattern at that point in the filename. (default: 'winston.log.%DATE%)
   */
  filename?: string;

  /**
   * The directory name to save log files to. (default: '.')
   */
  dirname?: string;

  /**
   * Write directly to a custom stream and bypass the rotation capabilities. (default: null)
   */
  stream?: NodeJS.WritableStream;

  /**
   * Maximum size of the file after which it will rotate. This can be a number of bytes, or units of kb, mb, and gb. If using the units, add 'k', 'm', or 'g' as the suffix. The units need to directly follow the number. (default: null)
   */
  maxSize?: string | number;

  /**
   * Maximum number of logs to keep. If not set, no logs will be removed. This can be a number of files or number of days. If using days, add 'd' as the suffix. (default: null)
   */
  maxFiles?: string | number;

  /**
   * An object resembling https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options indicating additional options that should be passed to the file stream. (default: `{ flags: 'a' }`)
   */
  options?: string | object;

  /**
   * A string representing the name of the name of the audit file. (default: './hash-audit.json')
   */
  auditFile?: string;

  /**
   * A string representing the frequency of rotation. (default: 'custom')
   */
  frequency?: string;

  /**
   * A boolean whether or not to generate file name from "datePattern" in UTC format. (default: false)
   */
  utc?: boolean;

  /**
   * A string representing an extension to be added to the filename, if not included in the filename property. (default: '')
   */
  extension?: string;

  /**
   * Create a tailable symlink to the current active log file. (default: false)
   */
  createSymlink?: boolean;

  /**
   * The name of the tailable symlink. (default: 'current.log')
   */
  symlinkName?: string;
}
