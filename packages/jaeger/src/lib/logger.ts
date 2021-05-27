import { Context } from '@midwayjs/core';
import { Inject, Logger as _Logger, Provide } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';

import { TracerManager } from './tracer';

/**
 * 自定义 Context Logger
 * - 封装 contextLogger & jaeger spanLog
 * - 打印日志同时会在链路上报日志级别和内容
 * - 生产环境应设置合理采样率避免过多的日志随链路上报
 */
@Provide()
export class Logger implements ILogger {
  @Inject() protected readonly ctx: Context;

  @_Logger() protected readonly logger: ILogger;

  debug(msg: unknown, ...args: unknown[]): void {
    tracerLogger({
      tracerManager: this.ctx.tracerManager,
      ctxLogger: this.logger,
      level: 'debug',
      msg,
      args,
    });
  }

  info(msg: unknown, ...args: unknown[]): void {
    tracerLogger({
      tracerManager: this.ctx.tracerManager,
      ctxLogger: this.logger,
      level: 'info',
      msg,
      args,
    });
  }

  warn(msg: unknown, ...args: unknown[]): void {
    tracerLogger({
      tracerManager: this.ctx.tracerManager,
      ctxLogger: this.logger,
      level: 'warn',
      msg,
      args,
    });
  }

  error(msg: unknown, ...args: unknown[]): void {
    tracerLogger({
      tracerManager: this.ctx.tracerManager,
      ctxLogger: this.logger,
      level: 'error',
      msg,
      args,
    });
  }
}

interface LogOptions {
  tracerManager: TracerManager;
  ctxLogger: ILogger;
  level: keyof ILogger;
  msg: unknown;
  args: unknown[];
}
function tracerLogger(options: LogOptions): void {
  const { tracerManager, ctxLogger, level, msg, args } = options;
  ctxLogger[level](msg, ...args);
  tracerManager.spanLog({ [level]: [msg, ...args] });
}
