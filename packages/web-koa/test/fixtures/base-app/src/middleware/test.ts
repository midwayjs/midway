import { Middleware } from '@midwayjs/decorator';
import { FunctionMiddleware, IMiddleware } from '@midwayjs/core';
import { Context } from '../../../../../src';
import { Next } from 'koa';

@Middleware()
export class TestMiddleware implements IMiddleware<Context, Next> {
  resolve(): FunctionMiddleware<Context, Next> {
    return async (ctx, next) => {
      return await next();
    }
  }

  match(ctx: Context): boolean {
    return ctx.path === '/api';
  }
}
