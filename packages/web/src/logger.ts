import {
  loggers,
  ILogger,
  IMidwayLogger,
  LoggerOptions,
} from '@midwayjs/logger';
import { join, isAbsolute, dirname, basename } from 'path';
import { existsSync, lstatSync, statSync, renameSync, unlinkSync } from 'fs';
import { Application, EggLogger } from 'egg';
import { getCurrentDateString } from './utils';
import * as os from 'os';
import {
  MidwayLoggerService,
  getCurrentApplicationContext,
  MidwayConfigService,
} from '@midwayjs/core';
import { debuglog } from 'util';

const debug = debuglog('midway:debug');
const isWindows = os.platform() === 'win32';

function isEmptyFile(p: string) {
  return statSync(p).size === 0;
}

const levelTransform = level => {
  // egg 自定义日志，不设置 level，默认是 info
  if (!level) {
    return 'info';
  }
  switch (level) {
    case 'NONE':
    case Infinity: // egg logger 的 none 是这个等级
      return 'none';
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

function checkEggLoggerExistsAndBackup(dir, fileName) {
  const file = isAbsolute(fileName) ? fileName : join(dir, fileName);
  try {
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
  } catch (err) {
    // ignore
  }
}

function cleanUndefinedProperty(obj) {
  Object.keys(obj).forEach(key => {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  });
}

class MidwayLoggers extends Map<string, ILogger> {
  protected app: Application;
  protected loggerService: MidwayLoggerService;

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
   * @param app
   */
  constructor(app: Application) {
    super();
    /**
     * 在 egg 这里创建 loggers，并初始化 loggerService
     */
    // 这么改是为了防止 egg 日志切割时遍历属性，导致报错
    Object.defineProperty(this, 'app', {
      value: app,
      enumerable: false,
    });

    const configService =
      getCurrentApplicationContext().get(MidwayConfigService);

    // 先把 egg 的日志配置转为 midway logger 配置
    if (configService.getConfiguration('customLogger')) {
      const eggLoggerConfig = this.transformEggLogger(
        configService.getConfiguration('customLogger'),
        configService.getConfiguration('midwayLogger.default')
      ) as any;
      if (eggLoggerConfig) {
        configService.addObject(eggLoggerConfig);
      }
    }

    const loggerConfig = configService.getConfiguration('midwayLogger');

    if (loggerConfig) {
      for (const id of Object.keys(loggerConfig.clients)) {
        const config = Object.assign(
          {},
          loggerConfig['default'],
          loggerConfig.clients[id]
        );
        this.createLogger(config, id);
      }
    }

    if (!this['logger']) {
      this['logger'] = loggers.getLogger('appLogger');
      this.set('logger', loggers.getLogger('appLogger'));
    }

    // 初始化日志服务
    this.loggerService = getCurrentApplicationContext().get(
      MidwayLoggerService,
      [getCurrentApplicationContext()]
    );
    // 防止循环枚举报错
    Object.defineProperty(this, 'loggerService', {
      enumerable: false,
    });
  }

  createLogger(options, loggerKey: string) {
    /**
     * 提前备份 egg 日志
     */
    checkEggLoggerExistsAndBackup(options.dir, options.fileLogName);
    let logger: ILogger = loggers.createLogger(loggerKey, options);

    // overwrite values for pandora collect
    (logger as any).values = () => {
      return [];
    };

    if (process.env['EGG_CLUSTER_MODE'] !== 'true') {
      logger = new Proxy(logger, {
        get(target, prop, receiver) {
          if (prop === 'close') {
            return () => {};
          }
          return target[prop];
        },
      });
    }

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

  transformEggLogger(eggCustomLogger, midwayLoggerConfig: LoggerOptions) {
    const transformLoggerConfig = {
      midwayLogger: {
        clients: {},
      },
    };

    for (const name in eggCustomLogger) {
      const file = eggCustomLogger[name]?.file;
      if (!file) {
        continue;
      }
      const options = {} as any;
      if (isAbsolute(file)) {
        // 绝对路径，单独处理
        options.dir = dirname(file);
        options.fileLogName = basename(file);
        options.auditFileDir =
          midwayLoggerConfig.auditFileDir === '.audit'
            ? join(midwayLoggerConfig.dir, '.audit')
            : midwayLoggerConfig.auditFileDir;
        options.errorDir =
          midwayLoggerConfig.errorDir ?? midwayLoggerConfig.dir;
      } else {
        // 相对路径，使用默认的 dir 即可
        options.fileLogName = file;
      }
      transformLoggerConfig.midwayLogger.clients[name] = {
        level: levelTransform(eggCustomLogger[name]?.level),
        consoleLevel: levelTransform(eggCustomLogger[name]?.consoleLevel),
        ...options,
      };
      cleanUndefinedProperty(transformLoggerConfig.midwayLogger.clients[name]);
    }
    return transformLoggerConfig;
  }
}

export const createLoggers = (
  app: Application,
  processType: 'agent' | 'app'
) => {
  // 现在只走 midway logger
  const loggers = new MidwayLoggers(app);
  // won't print to console after started, except for local and unittest
  app.ready(() => {
    if (app.config.logger?.disableConsoleAfterReady) {
      loggers.disableConsole();
    }
  });
  debug(`[egg]: create loggers in ${processType}`);
  loggers['coreLogger'].info(
    '[egg:logger] init all loggers with options: %j',
    app.config.midwayLogger
  );

  return loggers;
};
