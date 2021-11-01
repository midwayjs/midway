import { Provide } from '@midwayjs/decorator';
import { IMiddleware } from '@midwayjs/core';
import { FaaSContext } from '../../../../../src';

@Provide('auth')
export class AuthMiddleware implements IMiddleware<FaaSContext> {
  resolve() {
    return async (ctx, next) => {
      ctx.extraData = 'extra data';
      return await next();
    };
  }
}
