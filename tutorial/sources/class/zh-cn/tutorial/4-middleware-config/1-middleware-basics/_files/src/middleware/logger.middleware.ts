import { Middleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';

@Middleware()
export class LoggerMiddleware {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const startTime = Date.now();
      console.log(`→ ${ctx.method} ${ctx.url}`);
      await next();
      const duration = Date.now() - startTime;
      console.log(`← ${ctx.method} ${ctx.url} ${ctx.status} ${duration}ms`);
    };
  }
}
