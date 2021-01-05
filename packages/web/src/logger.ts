import { EggLoggers as BaseEggLoggers, EggLogger, Transport } from 'egg-logger';
import { loggers, MidwayBaseLogger, transports } from '@midwayjs/logger';
import { relative, join, isAbsolute, dirname, basename } from 'path';
import { existsSync, lstatSync, readFileSync, renameSync, unlinkSync } from 'fs';
import { Application } from 'egg';
import { MidwayFrameworkType, MidwayProcessTypeEnum } from '@midwayjs/core';
import { getCurrentDateString } from './utils';
import * as os from 'os';

const isWindows = os.platform() === 'win32';

export class WebConsoleTransport extends transports.Console {

  app: Application;
  constructor(app: Application) {
    super();
    this.app = app;
  }

  log(info, callback) {
    if (this.app.getFrameworkType() === MidwayFrameworkType.WEB) {
      return;
    }
    return super.log(info, callback);
  }
}

const levelTransform = (level) => {
  switch (level) {
    case Infinity:      // egg logger 的 none 是这个等级
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
}

/**
 * output log into file {@link Transport}。
 */
class WinstonTransport extends Transport {
  transportLogger: MidwayBaseLogger;

  constructor(options) {
    super(options);
    this.transportLogger = loggers.createLogger(
      options.transportName,
      Object.assign(options, {
        disableConsole: true,
        disableError: true,   // EggJS 的默认转发到错误日志是通过设置重复的 logger 实现的，在这种情况下代理会造成 midway 写入多个 error 日志，默认需要移除掉
        level: levelTransform(options.level),
      })
    ) as MidwayBaseLogger;
    // 由于现在的日志是个大池子，其他框架也会和 egg 复用日志对象，在这种场景下，如果和 egg 复用（socket）Logger，那么池子里存在的，可能只有 fileLogger，不会输出控制台日志。
    // 解决的方法是，添加一个 transport，其中判断如果 app 是非 egg 的时候则输出
    this.transportLogger.add(new WebConsoleTransport(options.app));
  }

  /**
   * output log, see {@link Transport#log}
   * @param  {String} level - log level
   * @param  {Array} args - all arguments
   * @param  {Object} meta - meta information
   */
  log(level, args, meta) {
    const msg = (super.log(level, args, meta) as unknown) as string;
    const winstonLevel = levelTransform(level);
    if (winstonLevel) {
      this.transportLogger.log(winstonLevel, msg.replace('\n', ''));
    }
  }
}


function isEmptyFile(p: string) {
  let content = readFileSync(p, {
    encoding: 'utf8'
  });
  return content === null || content === undefined || content === '';
}

function checkEggLoggerExists(dir, fileName, eggLoggerFiles) {
  const file = isAbsolute(fileName) ? fileName : join(dir, fileName);
  if (existsSync(file) && !lstatSync(file).isSymbolicLink()) {
    // 如果是空文件，则直接删了，否则加入备份队列
    if (isEmptyFile(file)) {
      // midway 的软链在 windows 底下也不会创建出来，在 windows 底下就不做文件删除了
      if (!isWindows) {
        unlinkSync(file);
      }
    } else {
      eggLoggerFiles.push(fileName);
      if (!isAbsolute(fileName)) {
        eggLoggerFiles.push(join(dir, fileName));
      }
    }
  }
}

class EggLoggers extends BaseEggLoggers {
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
    super(options);
    this.app = app;
    /**
     * 由于 egg 的日志生成不是软链，每次都会创建，无法覆盖这个行为
     * 1、如果以前存在老的 egg 日志，必然存在非软链文件，则重命名备份
     * 2、如果新项目没有老 egg 日志，必然在 super 时会创建空文件，则情况同 1
     * 3、如果之前已经是 midway 的日志，则文本为软链，egg 也不会新创文件，则不作处理
     */
    const eggLoggerFiles = [];
    for (const name of [
      options.logger.appLogName,
      options.logger.coreLogName,
      options.logger.agentLogName,
      options.logger.errorLogName,
    ]) {
      checkEggLoggerExists(options.logger.dir, name, eggLoggerFiles);
    }
    if (options.customLogger) {
      for (const customLogger of Object.values(options.customLogger)) {
        checkEggLoggerExists(
          customLogger['dir'] || options.logger.dir,
          customLogger['file'],
          eggLoggerFiles
        );
      }
    }
    for (const name of this.keys()) {
      this.updateTransport(name, eggLoggerFiles);
    }
  }

  updateTransport(name: string, eggLoggerFiles: string[]) {
    const logger = this.get(name) as EggLogger;
    const eggLogFile = (logger as any).options.file;
    let fileLogName;
    let logDir;
    if (isAbsolute(eggLogFile)) {
      logDir = dirname(eggLogFile);
      fileLogName = basename(eggLogFile);
    } else {
      logDir = (logger as any).options.dir;
      fileLogName = relative(logDir, eggLogFile);
    }

    // 关闭日志
    logger.get('file').close();

    // 备份老 egg 日志
    if (
      existsSync(eggLogFile) &&
      eggLoggerFiles.includes(eggLogFile)
    ) {
      const timeFormat = getCurrentDateString();
      renameSync(eggLogFile, eggLogFile + '.' + timeFormat + '_eggjs_bak');
    }

    if (this.app.getProcessType() === MidwayProcessTypeEnum.AGENT) {
      // agent 的日志名做特殊处理，使得和 application 分开
      if (name === 'logger' || name === 'coreLogger') {
        name = 'agent:' + name;
      }
    }

    logger.set(
      'file',
      new WinstonTransport({
        dir: logDir,
        file: eggLogFile,     // 原来 egg 的 file
        fileLogName,
        level: (logger as any).options.level,
        transportName: name,
        app: this.app,
      })
    );
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

  const loggers = new EggLoggers(app.config, app);

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
