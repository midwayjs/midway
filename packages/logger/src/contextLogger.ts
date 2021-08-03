import { ILogger } from './interface';

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
        ctx: this.ctx,
      },
    ]);
  }

  formatContextLabel() {
    return '';
  }
}
