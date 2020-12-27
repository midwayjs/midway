import { createLogger, transports, Logger, format } from 'winston';
import * as DailyRotateFileTransport from 'winston-daily-rotate-file';
import { DelegateLoggerOptions, LoggerLevel, LoggerOptions } from './interface';
import { DelegateTransport, EmptyTransport } from './transport';
import {
  displayLabelText,
  displayCommonMessage,
} from './format';

export const EmptyLogger: Logger = createLogger().constructor as Logger;

/**
 *  base logger with console transport and file transport
 */
export class MidwayBaseLogger extends EmptyLogger {
  consoleTransport;
  fileTransport;
  errTransport;
  loggerOptions;
  labels = [];

  constructor(options: LoggerOptions = {}) {
    super();
    this.loggerOptions = options;
    if (this.loggerOptions.label) {
      this.labels.push(this.loggerOptions.label);
    }

    this.configure(this.getLoggerConfigure());

    this.consoleTransport = new transports.Console({
      level: options.consoleLevel || 'silly',
      format: format.combine(
        format.colorize({ all: true }),
      ),
    });

    if (options.disableConsole !== true) {
      this.enableConsole();
    }

    options.dir = options.dir || process.cwd();
    options.fileLogName = options.fileLogName || 'midway-core.log';
    options.errorLogName = options.errorLogName || 'common-error.log';

    if (options.disableFile !== true) {
      this.enableFile();
    }

    if (options.disableError !== true) {
      this.enableError();
    }
    this.add(new EmptyTransport());
  }

  disableConsole() {
    this.remove(this.consoleTransport);
  }

  enableConsole() {
    this.add(this.consoleTransport);
  }

  disableFile() {
    this.remove(this.fileTransport);
  }

  enableFile() {
    if (!this.fileTransport) {
      this.fileTransport = new DailyRotateFileTransport({
        dirname: this.loggerOptions.dir,
        filename: this.loggerOptions.fileLogName,
        datePattern: 'YYYY-MM-DD',
        level: this.loggerOptions.fileLevel || 'silly',
        createSymlink: true,
        symlinkName: this.loggerOptions.fileLogName,
        maxSize: this.loggerOptions.fileMaxSize || '100m',
        maxFiles: this.loggerOptions.fileMaxFiles || null,
      });
    }
    this.add(this.fileTransport);
  }

  disableError() {
    this.remove(this.errTransport);
  }

  enableError() {
    if (!this.errTransport) {
      this.errTransport = new DailyRotateFileTransport({
        dirname: this.loggerOptions.dir,
        filename: this.loggerOptions.errorLogName,
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        createSymlink: true,
        symlinkName: this.loggerOptions.errorLogName,
        maxSize: this.loggerOptions.errMaxSize || '100m',
        maxFiles: this.loggerOptions.errMaxFiles || null,
      });
    }
    this.add(this.errTransport);
  }

  updateLevel(level: LoggerLevel) {
    this.level = level;
    this.consoleTransport.level = level;
    this.fileTransport.level = level;
  }

  getLoggerConfigure() {
    return {
      format: format.combine(
        displayCommonMessage(),
        displayLabelText({
          labels: this.labels
        }),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss,SSS',
        }),
        format.splat(),
        format.printf(
          info =>
            `${info.timestamp} ${info.LEVEL} ${info.pid} ${info.labelText}${info.message}`
        )
      ),
    };
  }
}

/**
 * framework delegate logger, it can proxy logger output to another logger
 */
export class MidwayDelegateLogger extends MidwayBaseLogger {
  constructor(options: DelegateLoggerOptions) {
    super({
      disableConsole: true,
      disableFile: true,
      disableError: true,
    });
    this.add(
      new DelegateTransport({
        delegateLogger: options.delegateLogger,
      })
    );
  }
}
