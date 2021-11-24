import { Middleware } from '@midwayjs/decorator';
import { IMiddleware } from '@midwayjs/core';
import { Context } from '../../../../../src';
import { Next } from 'koa';

@Middleware()
export class TestMiddleware implements IMiddleware<Context, Next> {
  resolve() {
    return async (ctx, next) => {
      return await next();
    }
  }

  match(ctx) {
    return ctx.path === '/api';
  }
}
