import { NextFunction } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

export async function loggerMiddleware(ctx: Context, next: NextFunction) {
  const start = Date.now();
  await next();
  ctx.logger.info(`[functional] ${ctx.method} ${ctx.url} ${ctx.status} ${Date.now() - start}ms`);
}
