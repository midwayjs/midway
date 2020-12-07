import { createLogger, transports, Logger, format } from 'winston';
import * as DailyRotateFileTransport from 'winston-daily-rotate-file';
import { ILogger } from './interface';
import { DelegateTransport } from './delegateTransport';

const WinstonLogger: Logger = createLogger().constructor as Logger;

function joinLoggerLabel(...labels) {
  if (labels.length === 0) {
    return '';
  } else {
    const newLabels = labels.filter(label => {
      return !!label;
    });
    return `[${newLabels.join(':')}]`;
  }
}

/**
 *  扩展支持框架、类等标签
 */
export class BaseLogger extends WinstonLogger {
  consoleTransport;

  constructor(
    options: {
      frameworkType?: string;
    } = {}
  ) {
    super({
      defaultMeta: {
        framework: options.frameworkType || '',
      },
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
            } ${joinLoggerLabel(info.framework, info['className'])} ${
              info.message
            }${info.stack || ''}`
        )
      ),
    });
    this.consoleTransport = new transports.Console({
      level: 'silly',
      format: format.combine(format.colorize({ all: true })),
    });

    this.add(this.consoleTransport);
  }

  disableConsole() {
    this.remove(this.consoleTransport);
  }
}

/**
 * 框架日志
 *  1.1 本地只输出控制台，不输出到文件
 *  1.2 服务器环境只输出到文件（midway-core.log)，不输出到控制台
 *  1.3 所有的错误单独输出到 common-error.log 文件
 *  1.4 日志切割能力
 */
export class MidwayFrameworkLogger extends BaseLogger {
  constructor(
    options: {
      dir?: string;
      coreLogName?: string;
      errorLogName?: string;
      label?: string;
    } = {}
  ) {
    super();
    options.dir = options.dir || process.cwd();
    options.coreLogName = options.coreLogName || 'midway-core.log';
    options.errorLogName = options.errorLogName || 'common-error.log';
    this.add(
      new DailyRotateFileTransport({
        dirname: options.dir,
        filename: options.errorLogName,
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        format: format.simple(),
        createSymlink: true,
        symlinkName: options.errorLogName,
        maxSize: '200m',
      })
    );
    this.add(
      new DailyRotateFileTransport({
        dirname: options.dir,
        filename: options.coreLogName,
        datePattern: 'YYYY-MM-DD',
        level: 'info',
        format: format.simple(),
        createSymlink: true,
        symlinkName: options.coreLogName,
        maxSize: '200m',
      })
    );
  }
}

/**
 * framework delegate logger, it can proxy logger output to another logger
 */
export class MidwayFrameworkDelegateLogger extends BaseLogger {
  constructor(
    options: {
      delegateLogger?: ILogger;
    } = {}
  ) {
    super();
    if (options.delegateLogger) {
      this.add(
        new DelegateTransport({
          delegateLogger: options.delegateLogger,
        })
      );
    }
  }
}
