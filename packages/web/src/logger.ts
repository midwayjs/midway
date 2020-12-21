import { EggLoggers as BaseEggLoggers, EggLogger, Transport } from 'egg-logger';
import { loggers, ILogger } from '@midwayjs/logger';
import { relative } from 'path';
import { existsSync, lstatSync, unlinkSync } from 'fs';

/**
 * output log into file {@link Transport}。
 */
class WinstonTransport extends Transport {

  transportLogger: ILogger;

  constructor(options) {
    super(options);
    this.transportLogger = loggers.createLogger(options.transportName, Object.assign(options, {
      disableConsole: true,
    }));
  }

  /**
   * output log, see {@link Transport#log}
   * @param  {String} level - log level
   * @param  {Array} args - all arguments
   * @param  {Object} meta - meta information
   */
  log(level, args, meta) {
    const msg = super.log(level, args, meta) as unknown as string;
    this.transportLogger.log(level.toLowerCase(), msg.replace('\n', ''));
  }
}

class EggLoggers extends BaseEggLoggers {

  /**
   * @constructor
   * @param  {Object} config - egg app config
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
   */
  constructor(options) {
    super(options);
    for(const name of this.keys()) {
      this.updateTransport(name);
    }
  }

  updateTransport(name: string) {
    const logger = this.get(name) as EggLogger;
    let fileLogName = relative((logger as any).options.dir, (logger as any).options.file);
    logger.get('file').close();

    if (existsSync((logger as any).options.file) && !lstatSync((logger as any).options.file).isSymbolicLink()) {
      unlinkSync((logger as any).options.file);
    }

    logger.set('file', new WinstonTransport({
      dir: (logger as any).options.dir,
      fileLogName,
      level: (logger as any).options.level,
      transportName: name,
    }));
  }
}

export const createLoggers = (app) => {
  const loggerConfig = app.config.logger;
  loggerConfig.type = app.type;

  if (app.config.env === 'prod' && loggerConfig.level === 'DEBUG' && !loggerConfig.allowDebugAtProd) {
    loggerConfig.level = 'INFO';
  }

  const loggers = new EggLoggers(app.config);

  // won't print to console after started, except for local and unittest
  app.ready(() => {
    if (loggerConfig.disableConsoleAfterReady) {
      loggers.disableConsole();
    }
  });
  loggers.coreLogger.info('[egg:logger] init all loggers with options: %j', loggerConfig);

  return loggers;
};
