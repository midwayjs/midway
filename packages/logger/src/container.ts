import {
  ILogger,
  IMidwayLogger,
  LoggerLevel,
  LoggerOptions,
} from './interface';
import { MidwayBaseLogger } from './logger';

/**
 * 数组结构为获取当前的状态值 + 恢复状态值的方法
 */
const statusMapping = {
  disableConsole: ['isEnableConsole', 'enableConsole'],
  disableFile: ['isEnableFile', 'enableFile'],
  disableError: ['isEnableError', 'enableError'],
  updateLevel: ['getLevel', 'updateLevel'],
  updateConsoleLevel: ['getConsoleLevel', 'updateConsoleLevel'],
  updateFileLevel: ['getFileLevel', 'updateFileLevel'],
};

type ContainerCoverMethodName =
  | 'disableConsole'
  | 'disableFile'
  | 'disableError'
  | 'updateLevel'
  | 'updateConsoleLevel'
  | 'updateFileLevel';

export class MidwayLoggerContainer extends Map<string, ILogger> {
  private containerOptions: LoggerOptions;
  private loggerOriginData = {};
  private containerLoggerData = {};

  constructor(options: LoggerOptions = {}) {
    super();
    this.containerOptions = options;
  }

  createLogger(name: string, options: LoggerOptions): ILogger {
    if (!this.has(name)) {
      const logger = new MidwayBaseLogger(
        Object.assign(options, this.containerOptions)
      );

      this.syncOriginStatus(name, logger);

      this.addLogger(name, logger);
      this.set(name, logger);
      return logger;
    }

    return this.getLogger(name);
  }

  addLogger(name: string, logger: ILogger, errorWhenReplace = true) {
    if (!errorWhenReplace || !this.has(name)) {
      // 同一个实例就不需要再添加了
      if (this.get(name) !== logger) {
        if (logger['on']) {
          this.syncOriginStatus(name, logger);
          (logger as any).on('close', () => this.delete(name));
        }
        this.set(name, logger);
      }
    } else {
      throw new Error(`logger id ${name} has duplicate`);
    }
    return this.get(name);
  }

  getLogger(name: string) {
    return this.get(name);
  }

  removeLogger(name: string) {
    const logger = this.get(name);
    logger?.['close']();
    this.delete(name);
    delete this.loggerOriginData[name];
  }

  /**
   * Closes a `Logger` instance with the specified `name` if it exists.
   * If no `name` is supplied then all Loggers are closed.
   * @param {?string} name - The id of the Logger instance to close.
   * @returns {undefined}
   */
  close(name?: string) {
    if (name) {
      return this.removeLogger(name);
    }

    Array.from(this.keys()).forEach(key => this.removeLogger(key));
  }

  updateContainerOption(options: LoggerOptions) {
    this.containerOptions = Object.assign(this.containerOptions, options);
  }

  reset() {
    this.close();
    this.containerOptions = {};
    this.loggerOriginData = {};
  }

  private setLoggerOriginData(
    name,
    logger,
    methodName: ContainerCoverMethodName,
    value?
  ) {
    if (!logger) return;
    this.loggerOriginData[name] = this.loggerOriginData[name] || {};
    if (logger[methodName]) {
      // store origin status
      this.loggerOriginData[name][methodName] =
        logger[statusMapping[methodName][0]].call(logger);
      // set new value
      logger[methodName].call(logger, value);
    }
  }

  private syncOriginStatus(name, logger) {
    Object.keys(this.containerLoggerData).forEach(methodName => {
      this.setLoggerOriginData(
        name,
        logger,
        methodName as ContainerCoverMethodName,
        this.containerLoggerData[methodName]
      );
    });
  }

  disableConsole() {
    this.containerLoggerData['disableConsole'] = true;
    Array.from(this.keys()).forEach(key => {
      const logger = this.get(key) as IMidwayLogger;
      this.setLoggerOriginData(key, logger, 'disableConsole');
    });
  }

  disableFile() {
    this.containerLoggerData['disableFile'] = true;
    Array.from(this.keys()).forEach(key => {
      const logger = this.get(key) as IMidwayLogger;
      this.setLoggerOriginData(key, logger, 'disableFile');
    });
  }

  disableError() {
    this.containerLoggerData['disableError'] = true;
    Array.from(this.keys()).forEach(key => {
      const logger = this.get(key) as IMidwayLogger;
      this.setLoggerOriginData(key, logger, 'disableError');
    });
  }

  updateLevel(level: LoggerLevel) {
    this.containerLoggerData['updateLevel'] = level;
    Array.from(this.keys()).forEach(key => {
      const logger = this.get(key) as IMidwayLogger;
      this.setLoggerOriginData(key, logger, 'updateLevel', level);
    });
  }

  updateConsoleLevel(level: LoggerLevel) {
    this.containerLoggerData['updateConsoleLevel'] = level;
    Array.from(this.keys()).forEach(key => {
      const logger = this.get(key) as IMidwayLogger;
      this.setLoggerOriginData(key, logger, 'updateConsoleLevel', level);
    });
  }

  updateFileLevel(level: LoggerLevel) {
    this.containerLoggerData['updateFileLevel'] = level;
    Array.from(this.keys()).forEach(key => {
      const logger = this.get(key) as IMidwayLogger;
      this.setLoggerOriginData(key, logger, 'updateFileLevel', level);
    });
  }

  restore() {
    Array.from(Object.keys(this.loggerOriginData)).forEach(key => {
      const logger = this.get(key) as IMidwayLogger;
      for (const method in this.loggerOriginData[key]) {
        if (this.loggerOriginData[key][method]) {
          // 为 true 或者有值的时候才设置
          logger[statusMapping[method][1]].call(
            logger,
            this.loggerOriginData[key][method]
          );
        }
      }
    });
    this.loggerOriginData = {};
    this.containerLoggerData = {};
  }
}
