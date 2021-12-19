import { Middleware } from '@midwayjs/decorator';
import { FunctionMiddleware, IMiddleware } from '@midwayjs/core';
import { Context } from '../../../../../src';
import { Next } from 'koa';

@Middleware()
export class TestMiddleware implements IMiddleware<Context, Next> {
  resolve(): FunctionMiddleware<Context, Next> {
    return async (ctx, next) => {
      ctx.body = '1';
      return await next();
    }
  }
}

@Middleware()
export class TestMiddleware1 implements IMiddleware<Context, Next> {
  resolve(): FunctionMiddleware<Context, Next> {
    return async (ctx, next) => {
      ctx.body = ctx.body as string + '2';
      return await next();
    }
  }
}

@Middleware()
export class TestMiddleware2 implements IMiddleware<Context, Next> {
  resolve(): FunctionMiddleware<Context, Next> {
    return async (ctx, next) => {
      ctx.body = ctx.body as string + '3';
      return await next();
    }
  }
}
