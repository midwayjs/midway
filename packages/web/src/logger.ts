import { EggLoggers } from 'egg-logger';
import {
  loggers,
  ILogger,
  IMidwayLogger,
  MidwayContextLogger,
} from '@midwayjs/logger';
import { join, isAbsolute } from 'path';
import {
  existsSync,
  lstatSync,
  readFileSync,
  renameSync,
  unlinkSync,
} from 'fs';
import { Application, EggLogger, Context } from 'egg';
import { MidwayProcessTypeEnum } from '@midwayjs/core';
import { getCurrentDateString } from './utils';
import * as os from 'os';

const isWindows = os.platform() === 'win32';

const levelTransform = level => {
  switch (level) {
    case 'NONE':
    case Infinity: // egg logger 的 none 是这个等级
      return null;
    case 0:
    case 'DEBUG':
    case 'debug':
      return 'debug';
    case 1:
    case 'INFO':
    case 'info':
      return 'info';
    case 2:
    case 'WARN':
    case 'warn':
      return 'warn';
    case 3:
    case 'ERROR':
    case 'error':
      return 'error';
    default:
      return 'silly';
  }
};

function isEmptyFile(p: string) {
  const content = readFileSync(p, {
    encoding: 'utf8',
  });
  return content === null || content === undefined || content === '';
}

function checkEggLoggerExistsAndBackup(dir, fileName) {
  const file = isAbsolute(fileName) ? fileName : join(dir, fileName);
  if (existsSync(file) && !lstatSync(file).isSymbolicLink()) {
    // 如果是空文件，则直接删了，否则加入备份队列
    if (isEmptyFile(file)) {
      // midway 的软链在 windows 底下也不会创建出来，在 windows 底下就不做文件删除了
      if (!isWindows) {
        unlinkSync(file);
      }
    } else {
      const timeFormat = getCurrentDateString();
      renameSync(file, file + '.' + timeFormat + '_eggjs_bak');
    }
  }
}

function removeSymbol(dir, fileName) {
  const file = isAbsolute(fileName) ? fileName : join(dir, fileName);
  if (existsSync(file) && lstatSync(file).isSymbolicLink()) {
    if (!isWindows) {
      unlinkSync(file);
    }
  }
}

function checkMidwayLoggerSymbolExistsAndRemove(appConfig: any) {
  removeSymbol(appConfig.logger['dir'], appConfig.logger['appLogName']);
  removeSymbol(appConfig.logger['dir'], appConfig.logger['coreLogName']);
  removeSymbol(appConfig.logger['dir'], appConfig.logger['agentLogName']);
  removeSymbol(appConfig.logger['dir'], appConfig.logger['errorLogName']);
  for (const loggerOption in appConfig['customLogger']) {
    removeSymbol(
      appConfig.logger['dir'],
      appConfig['customLogger'][loggerOption].file
    );
  }
}

class MidwayLoggers extends Map<string, ILogger> {
  app: Application;

  /**
   * @constructor
   * - logger
   *   - {String} env - egg app runtime env string, detail please see `app.config.env`
   *   - {String} type - current process type, `application` or `agent`
   *   - {String} dir - log file dir
   *   - {String} [encoding = utf8] - log string encoding
   *   - {String} [level = INFO] - file log level
   *   - {String} [consoleLevel = NONE] - console log level
   *   - {Boolean} [outputJSON = false] - send JSON log or not
   *   - {Boolean} [buffer = true] - use {@link FileBufferTransport} or not
   *   - {String} appLogName - egg app file logger name
   *   - {String} coreLogName - egg core file logger name
   *   - {String} agentLogName - egg agent file logger name
   *   - {String} errorLogName - err common error logger name
   *   - {String} eol - end of line char
   *   - {String} [concentrateError = duplicate] - whether write error logger to common-error.log, `duplicate` / `redirect` / `ignore`
   * - customLogger
   * @param options
   * @param app
   */
  constructor(options, app: Application) {
    super();
    // 这么改是为了防止 egg 日志切割时遍历属性，导致报错
    Object.defineProperty(this, 'app', {
      value: app,
      enumerable: false,
    });
    /**
     * 提前备份 egg 日志
     */
    for (const name of [
      options.logger.appLogName,
      options.logger.coreLogName,
      options.logger.agentLogName,
      options.logger.errorLogName,
    ]) {
      checkEggLoggerExistsAndBackup(options.logger.dir, name);
    }
    // 创建标准的日志
    if (this.app.getProcessType() === MidwayProcessTypeEnum.AGENT) {
      this.createLogger(
        'coreLogger',
        {
          file: options.logger.agentLogName,
          level: options.logger?.coreLogger?.level,
          consoleLevel: options.logger?.coreLogger?.consoleLevel,
        },
        options.logger,
        'agent:coreLogger'
      );
      this.createLogger(
        'logger',
        { file: options.logger.appLogName },
        options.logger,
        'agent:logger'
      );
    } else {
      this.createLogger(
        'coreLogger',
        {
          file: options.logger.coreLogName,
          level: options.logger?.coreLogger?.level,
          consoleLevel: options.logger?.coreLogger?.consoleLevel,
        },
        options.logger,
        'coreLogger'
      );
      this.createLogger(
        'logger',
        { file: options.logger.appLogName },
        options.logger,
        'logger'
      );
    }
    if (options.customLogger) {
      for (const loggerKey in options.customLogger) {
        const customLogger = options.customLogger[loggerKey];
        checkEggLoggerExistsAndBackup(
          customLogger['dir'] || options.logger.dir,
          customLogger['file']
        );
        this.createLogger(loggerKey, customLogger, options.logger);
      }
    }
  }

  createLogger(
    loggerKey,
    options,
    defaultLoggerOptions,
    createLoggerKey?: string
  ) {
    const level = options.level
      ? levelTransform(options.level)
      : levelTransform(defaultLoggerOptions.level);
    const consoleLevel = options.consoleLevel
      ? levelTransform(options.consoleLevel)
      : levelTransform(defaultLoggerOptions.consoleLevel);
    const dir = options['dir'] || defaultLoggerOptions.dir;

    const logger: ILogger = loggers.createLogger(createLoggerKey || loggerKey, {
      dir,
      fileLogName: options.file,
      errorLogName: defaultLoggerOptions.errorLogName,
      level,
      consoleLevel,
      disableFile: level === null,
      disableConsole: consoleLevel === null,
      errorDir: dir,
    });

    // overwrite values for pandora collect
    (logger as any).values = () => {
      return [];
    };

    this[loggerKey] = logger;
    this.set(loggerKey, logger);
    return logger;
  }

  disableConsole() {
    for (const value of this.values()) {
      if ((value as IMidwayLogger)?.disableConsole) {
        (value as IMidwayLogger)?.disableConsole();
      } else if ((value as EggLogger).disable) {
        (value as EggLogger).disable('console');
      }
    }
  }

  reload() {
    // 忽略 midway logger，只有 egg logger 需要做切割
    for (const value of this.values()) {
      if ((value as EggLogger).reload) {
        (value as EggLogger).reload();
      }
    }
  }
}

export const createLoggers = (app: Application) => {
  const loggerConfig = app.config.logger as any;
  loggerConfig.type = app.type;

  if (
    app.config.env === 'prod' &&
    loggerConfig.level === 'DEBUG' &&
    !loggerConfig.allowDebugAtProd
  ) {
    loggerConfig.level = 'INFO';
  }

  let loggers;

  if (app.config.midwayFeature['replaceEggLogger']) {
    loggers = new MidwayLoggers(app.config, app);
  } else {
    checkMidwayLoggerSymbolExistsAndRemove(app.config);
    loggers = new EggLoggers(app.config as any);
  }
  // won't print to console after started, except for local and unittest
  app.ready(() => {
    if (loggerConfig.disableConsoleAfterReady) {
      loggers.disableConsole();
    }
  });
  loggers.coreLogger.info(
    '[egg:logger] init all loggers with options: %j',
    loggerConfig
  );

  return loggers;
};

export class MidwayEggContextLogger extends MidwayContextLogger<Context> {
  formatContextLabel() {
    const ctx = this.ctx;
    // format: '[$userId/$ip/$traceId/$use_ms $method $url]'
    const userId = ctx.userId || '-';
    const traceId = (ctx.tracer && ctx.tracer.traceId) || '-';
    const use = Date.now() - ctx.startTime;
    return (
      userId +
      '/' +
      ctx.ip +
      '/' +
      traceId +
      '/' +
      use +
      'ms ' +
      ctx.method +
      ' ' +
      ctx.url
    );
  }
}
