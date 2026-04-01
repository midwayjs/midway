import { NextFunction } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

export async function loggerMiddleware(ctx: Context, next: NextFunction) {
  const start = Date.now();
  ctx.logger.info(`[req] ${ctx.method} ${ctx.url}`);
  await next();
  ctx.logger.info(`[res] ${ctx.method} ${ctx.url} ${ctx.status} ${Date.now() - start}ms`);
}
