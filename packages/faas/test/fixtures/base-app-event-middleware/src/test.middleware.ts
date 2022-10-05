import { Provide } from '@midwayjs/core';
import { Context, NextFunction } from '../../../../src';

@Provide()
export class GlobalHttpMiddleware {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      ctx.setAttr('result', (ctx.getAttr('result') || 0) as number + 5);
      return await next();
    };
  }
}



@Provide()
export class GlobalEventMiddleware {
  resolve() {
    return async (ctx, next) => {
      ctx.setAttr('result', (ctx.getAttr('result') || 0) as number + 3);
      return await next();
    };
  }
}
