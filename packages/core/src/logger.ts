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
      ? join(framework.getAppDir(), 'logs', framework.getProjectName())
      : join(getUserHome(), 'logs', framework.getProjectName()),
    disableFile: isDevelopmentEnv,
    disableError: isDevelopmentEnv,
    level: isDevelopmentEnv ? 'info': 'warn',
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
    if (!['debug', 'info', 'warn', 'error'].includes(args[0])) {
      args.unshift('info');
    }
    this.transformLog('log', args);
  }

  debug(...args) {
    this.transformLog('debug', args);
  }

  info(...args) {
    this.transformLog('info', args);
  }

  warn(...args) {
    this.transformLog('warn', args);
  }

  error(...args) {
    this.transformLog('error', args);
  }

  private transformLog(level, args) {
    return this.contextLogger[level].apply(this.contextLogger, [
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
