import { createLogger, transports, Logger, format } from 'winston';
import * as DailyRotateFileTransport from 'winston-daily-rotate-file';
import {
  DelegateLoggerOptions,
  LoggerLevel,
  LoggerOptions,
  IMidwayLogger,
} from './interface';
import { DelegateTransport, EmptyTransport } from './transport';
import { displayLabels, displayCommonMessage } from './format';
import * as os from 'os';
import { basename, dirname, isAbsolute } from 'path';

const isWindows = os.platform() === 'win32';

export const EmptyLogger: Logger = createLogger().constructor as Logger;

/**
 *  base logger with console transport and file transport
 */
export class MidwayBaseLogger extends EmptyLogger implements IMidwayLogger {
  consoleTransport;
  fileTransport;
  errTransport;
  loggerOptions: LoggerOptions;
  defaultLabel = '';
  defaultMetadata = {};

  constructor(options: LoggerOptions = {}) {
    super(options);
    this.exitOnError = false;
    if (isWindows) {
      options.disableErrorSymlink = true;
      options.disableFileSymlink = true;
    }
    this.loggerOptions = options;
    if (this.loggerOptions.defaultLabel) {
      this.defaultLabel = this.loggerOptions.defaultLabel;
    }

    if (this.loggerOptions.defaultMeta) {
      this.defaultMetadata = this.loggerOptions.defaultMeta;
    }

    if (this.loggerOptions.format) {
      this.configure({
        format: this.loggerOptions.format,
      });
    } else {
      this.configure(this.getDefaultLoggerConfigure());
    }

    this.configure(
      Object.assign({}, this.getDefaultLoggerConfigure(), {
        format: this.loggerOptions.format,
      })
    );

    this.consoleTransport = new transports.Console({
      level: options.consoleLevel || options.level || 'silly',
      format: format.combine(format.colorize({
        all: true, colors: {
          info: 'reset'
        }
      })),
    });

    if (options.disableConsole !== true) {
      this.enableConsole();
    }

    options.dir = options.dir || process.cwd();
    options.fileLogName = options.fileLogName || 'midway-core.log';
    if (isAbsolute(options.fileLogName)) {
      options.dir = dirname(options.fileLogName);
      options.fileLogName = basename(options.fileLogName);
    }
    options.errorLogName = options.errorLogName || 'common-error.log';
    if (isAbsolute(options.errorLogName)) {
      options.errorDir = dirname(options.errorLogName);
      options.errorLogName = basename(options.errorLogName);
    }

    if (options.disableFile !== true) {
      this.enableFile();
    }

    if (options.disableError !== true) {
      this.enableError();
    }
    this.add(new EmptyTransport());
  }

  disableConsole(): void {
    this.remove(this.consoleTransport);
  }

  enableConsole(): void {
    this.add(this.consoleTransport);
  }

  disableFile(): void {
    this.remove(this.fileTransport);
  }

  enableFile(): void {
    if (!this.fileTransport) {
      this.fileTransport = new DailyRotateFileTransport({
        dirname: this.loggerOptions.dir,
        filename: this.loggerOptions.fileLogName,
        datePattern: 'YYYY-MM-DD',
        level:
          this.loggerOptions.fileLevel || this.loggerOptions.level || 'silly',
        createSymlink: this.loggerOptions.disableFileSymlink !== true,
        symlinkName: this.loggerOptions.fileLogName,
        maxSize: this.loggerOptions.fileMaxSize || '200m',
        maxFiles: this.loggerOptions.fileMaxFiles || '31d',
      });
    }
    this.add(this.fileTransport);
  }

  disableError(): void {
    this.remove(this.errTransport);
  }

  enableError(): void {
    if (!this.errTransport) {
      this.errTransport = new DailyRotateFileTransport({
        dirname: this.loggerOptions.errorDir || this.loggerOptions.dir,
        filename: this.loggerOptions.errorLogName,
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        createSymlink: this.loggerOptions.disableErrorSymlink !== true,
        symlinkName: this.loggerOptions.errorLogName,
        maxSize: this.loggerOptions.errMaxSize || '200m',
        maxFiles: this.loggerOptions.errMaxFiles || '31d',
      });
    }
    this.add(this.errTransport);
  }

  updateLevel(level: LoggerLevel): void {
    this.level = level;
    this.consoleTransport.level = level;
    this.fileTransport.level = level;
  }

  updateFileLevel(level: LoggerLevel): void {
    this.fileTransport.level = level;
  }

  updateConsoleLevel(level: LoggerLevel): void {
    this.consoleTransport.level = level;
  }

  updateDefaultLabel(defaultLabel: string): void {
    this.defaultLabel = defaultLabel;
  }

  updateDefaultMeta(defaultMetadata: Record<string, unknown>): void {
    this.defaultMetadata = defaultMetadata;
  }

  getDefaultLoggerConfigure() {
    return {
      format: format.combine(
        displayCommonMessage({
          target: this,
        }),
        displayLabels(),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss,SSS',
        }),
        format.splat(),
        format.printf(
          this.loggerOptions.printFormat
            ? this.loggerOptions.printFormat
            : info =>
                `${info.timestamp} ${info.LEVEL} ${info.pid} ${info.labelText}${info.message}`
        )
      ),
    };
  }

  getDefaultLabel(): string {
    return this.defaultLabel;
  }

  getDefaultMeta(): Record<string, unknown> {
    return this.defaultMetadata;
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
