import { Provide, Inject } from '@midwayjs/core';
import * as assert from 'assert';

@Provide()
export class TestMiddleware {
  @Inject()
  adb: any;

  resolve() {
    return async (ctx, next) => {
      assert.ok(this.adb);
      assert.ok(ctx.logger);
      ctx.requestId = 555;
      return await next();
    };
  }
}
