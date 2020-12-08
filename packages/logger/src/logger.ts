import { createLogger, transports, Logger, format } from 'winston';
import * as DailyRotateFileTransport from 'winston-daily-rotate-file';
import { DelegateLoggerOptions, LoggerOptions } from './interface';
import { DelegateTransport } from './delegateTransport';

export const EmptyLogger: Logger = createLogger().constructor as Logger;

function joinLoggerLabel(...labels) {
  if (labels.length === 0) {
    return '';
  } else {
    const newLabels = labels.filter(label => {
      return !!label;
    });
    if (newLabels.length === 0) {
      return '';
    } else {
      return `[${newLabels.join(':')}] `;
    }
  }
}

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
      format: format.combine(format.colorize({ all: true })),
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

  getLoggerConfigure() {
    return {
      format: format.combine(
        format.errors({ stack: true }),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss,SSS',
        }),
        format.splat(),
        format.printf(
          info =>
            `${info.timestamp} ${info.level.toUpperCase()} ${
              process.pid
            } ${joinLoggerLabel(...this.labels, ...[].concat(info.label))}${
              info.stack || info.message
            }`
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
    });
    this.add(
      new DelegateTransport({
        delegateLogger: options.delegateLogger,
      })
    );
  }
}
