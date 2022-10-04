import { Provide } from '@midwayjs/core';
import { IMiddleware } from '@midwayjs/core';
import { Context, NextFunction } from '../../../../../../src';

@Provide('auth')
export class AuthMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx, next) => {
      ctx.extraData = 'extra data';
      return await next();
    };
  }
}
