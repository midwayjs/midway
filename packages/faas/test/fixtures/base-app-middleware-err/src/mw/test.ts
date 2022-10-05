import { Provide } from '@midwayjs/core';

@Provide()
export class TestMiddleware {
  resolve() {
    return async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        ctx.body = 'ahello555'
      }
    };
  }
}
