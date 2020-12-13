import { createLogger, ILogger, LoggerOptions } from '@midwayjs/logger';
import { IMidwayFramework } from './interface';
import { isDevelopmentEnvironment, getUserHome } from './util';
import { join } from 'path';

export const createMidwayLogger = (
  framework: IMidwayFramework<any, any>,
  name: string,
  options: LoggerOptions = {}
) => {
  const isDevelopmentEnv = isDevelopmentEnvironment(
    framework.getCurrentEnvironment()
  );
  const loggerOptions: LoggerOptions = {
    dir: isDevelopmentEnv
      ? join(framework.getAppDir(), 'logs')
      : join(getUserHome(), 'logs'),
    disableFile: isDevelopmentEnv,
    disableError: isDevelopmentEnv,
  };
  return createLogger(name, Object.assign({}, loggerOptions, options));
};

export class MidwayContextLogger<T> {
  protected contextLogger: ILogger;
  public ctx: T;

  constructor(ctx, contextLogger: ILogger) {
    this.ctx = ctx;
    this.contextLogger = contextLogger;
  }

  log(...args) {
    return this.contextLogger.log.apply(this, [
      ...args,
      {
        label: this.formatContextLabel(),
      },
    ]);
  }

  debug(...args) {
    return this.contextLogger.debug.apply(this, [
      ...args,
      {
        label: this.formatContextLabel(),
      },
    ]);
  }

  info(...args) {
    return this.contextLogger.info.apply(this, [
      ...args,
      {
        label: this.formatContextLabel(),
      },
    ]);
  }

  warn(...args) {
    return this.contextLogger.warn.apply(this, [
      ...args,
      {
        label: this.formatContextLabel(),
      },
    ]);
  }

  error(...args) {
    return this.contextLogger.error.apply(this, [
      ...args,
      {
        label: this.formatContextLabel(),
      },
    ]);
  }

  formatContextLabel() {
    return '';
  }
}
