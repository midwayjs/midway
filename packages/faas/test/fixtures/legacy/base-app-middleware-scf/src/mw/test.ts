import { Provide, Inject } from '@midwayjs/decorator';
import * as assert from 'assert';

@Provide()
export class TestMiddleware {
  @Inject()
  adb: any;

  resolve() {
    return async (ctx, next) => {
      assert(this.adb);
      assert(ctx.logger);
      ctx.requestId = 555;
      return await next();
    };
  }
}
