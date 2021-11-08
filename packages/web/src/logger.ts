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
import { getCurrentDateString } from './utils';
import * as os from 'os';
import { MidwayLoggerService, safelyGet } from '@midwayjs/core';
import * as extend from 'extend2';
import { debuglog } from 'util';

const debug = debuglog('midway:debug');
const isWindows = os.platform() === 'win32';

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
  constructor(options, app: Application, processType: 'agent' | 'app') {
    super();
    /**
     * 日志创建的几种场景，主要考虑 2，4
     * 1、单进程，使用 egg logger
     * 2、单进程，使用 midway logger
     * 3、egg-scripts 多进程，使用 egg-logger
     * 4、egg-scripts 多进程，使用 midway logger
     */
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

    /**
     * 走到这里，有几种情况
     * 1、egg-scripts 启动，并使用了 midway logger，egg 先启动了
     * 2、单进程启动，但是没有 configuration，midway 没读到配置，日志服务没初始化
     * 3、再走一遍日志创建，把 egg 插件配置的日志再初始化一遍
     */
    const loggerService = new MidwayLoggerService(null);
    loggerService.configService = {
      getConfiguration(configKey?: string) {
        if (configKey) {
          return safelyGet(configKey, options);
        }
        return this.configuration;
      },
    } as any;

    const midwayLoggerConfig = loggerService.transformEggLogger(options) as any;
    extend(true, options, midwayLoggerConfig);

    if (options?.midwayLogger?.clients) {
      // 从 egg 过来，这里有可能没有 dir
      if (!options.midwayLogger['default']?.dir) {
        options.midwayLogger.default['dir'] = options.logger.dir;
      }

      for (const id of Object.keys(options.midwayLogger.clients)) {
        const config = Object.assign({}, options.midwayLogger['default'], options.midwayLogger.clients[id]);
        this.createLogger(config, id);
      }
    }

    if (!this['logger']) {
      this['logger'] = loggers.getLogger('appLogger');
      this.set('logger', loggers.getLogger('appLogger'));
    }

    if (loggers.has('coreLogger')) {
      this.createLogger({}, 'coreLogger');
      this.createLogger({}, 'appLogger');
      this.createLogger({}, 'agentLogger');
    } else {
      console.log('-----请在 logger 里配置 clients');
    }
  }

  createLogger(
    options,
    loggerKey: string
  ) {
    const logger: ILogger = loggers.createLogger(loggerKey, options);

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

export const createLoggers = (
  app: Application,
  processType: 'agent' | 'app'
) => {
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

  // 现在只走 midway logger
  loggers = new MidwayLoggers(app.config, app, processType);
  // won't print to console after started, except for local and unittest
  app.ready(() => {
    if (loggerConfig.disableConsoleAfterReady) {
      loggers.disableConsole();
    }
  });
  debug(`[egg]: create loggers in ${processType}`);
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
