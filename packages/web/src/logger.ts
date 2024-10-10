import { loggers, ILogger, LoggerOptions } from '@midwayjs/logger';
import { join, isAbsolute, dirname, basename } from 'path';
import { Application, EggLogger } from 'egg';
import {
  MidwayLoggerService,
  getCurrentApplicationContext,
  MidwayConfigService,
} from '@midwayjs/core';
import { debuglog } from 'util';
import { extend } from '@midwayjs/core';
import * as loggerModule from '@midwayjs/logger';

const isV3Logger = loggerModule['formatLegacyLoggerOptions'];
const debug = debuglog('midway:debug');

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

    let loggerConfig = configService.getConfiguration('midwayLogger');
    // 这里属于 hack 了，cluster 模式下会先走这里，找不到默认值
    // 先合并一遍默认配置
    configService.addObject(
      loggers.getDefaultMidwayLoggerConfig(configService.getAppInfo()),
      true
    );
    loggerConfig = configService.getConfiguration('midwayLogger');

    // 这里利用了 loggers 缓存的特性，提前初始化 logger
    if (loggerConfig) {
      for (const id of Object.keys(loggerConfig.clients)) {
        const config = extend(
          true,
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
      [
        getCurrentApplicationContext(),
        {
          loggerFactory: loggers,
        },
      ]
    );
    // 防止循环枚举报错
    Object.defineProperty(this, 'loggerService', {
      enumerable: false,
    });
  }

  createLogger(options, loggerKey: string) {
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
      if ((value as any)?.['disableConsole']) {
        (value as any).disableConsole();
      } else if ((value as unknown as EggLogger).disable) {
        (value as unknown as EggLogger).disable('console');
      } else if (isV3Logger) {
        // v3
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        value.get('console') && (value.get('console').level = 'none');
      }
    }
  }

  reload() {
    // 忽略 midway logger，只有 egg logger 需要做切割
    for (const value of this.values()) {
      if ((value as unknown as EggLogger).reload) {
        (value as unknown as EggLogger).reload();
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
          midwayLoggerConfig['auditFileDir'] === '.audit'
            ? join(midwayLoggerConfig['dir'], '.audit')
            : midwayLoggerConfig['auditFileDir'];
        options.errorDir =
          midwayLoggerConfig['errorDir'] ?? midwayLoggerConfig['dir'];
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
