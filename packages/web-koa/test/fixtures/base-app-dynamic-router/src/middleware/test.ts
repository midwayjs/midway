import { Middleware } from '@midwayjs/core';
import { FunctionMiddleware, IMiddleware } from '@midwayjs/core';
import { Context } from '../../../../../src';
import { Next } from 'koa';

@Middleware()
export class TestMiddleware implements IMiddleware<Context, Next> {
  resolve(): FunctionMiddleware<Context, Next> {
    return async (ctx, next) => {
      ctx.bbb = 123;
      return await next();
    }
  }
}
