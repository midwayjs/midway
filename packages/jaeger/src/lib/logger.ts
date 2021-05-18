import { Inject, Provide } from '@midwayjs/decorator';
import type { Context } from 'egg';

import { TracerManager } from './tracer';

interface ILogger {
  info(msg: unknown, ...args: unknown[]): void;
  debug(msg: unknown, ...args: unknown[]): void;
  error(msg: unknown, ...args: unknown[]): void;
  warn(msg: unknown, ...args: unknown[]): void;
}

/**
 * 自定义 Context Logger
 * - 封装 contextLogger & jaeger spanLog
 * - 打印日志同时会在链路上报日志级别和内容
 * - 生产环境应设置合理采样率避免过多的日志随链路上报
 */
@Provide()
export class Logger implements ILogger {
  @Inject() protected readonly ctx: Context;

  @Inject() protected readonly ctxLogger: ILogger;

  debug(msg: unknown, ...args: unknown[]) {
    tracerLogger({
      tracerManager: this.ctx.tracerManager,
      ctxLogger: this.ctxLogger,
      level: 'debug',
      msg,
      args,
    });
  }

  info(msg: unknown, ...args: unknown[]) {
    tracerLogger({
      tracerManager: this.ctx.tracerManager,
      ctxLogger: this.ctxLogger,
      level: 'info',
      msg,
      args,
    });
  }

  warn(msg: unknown, ...args: unknown[]) {
    tracerLogger({
      tracerManager: this.ctx.tracerManager,
      ctxLogger: this.ctxLogger,
      level: 'warn',
      msg,
      args,
    });
  }

  error(msg: unknown, ...args: unknown[]) {
    tracerLogger({
      tracerManager: this.ctx.tracerManager,
      ctxLogger: this.ctxLogger,
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
