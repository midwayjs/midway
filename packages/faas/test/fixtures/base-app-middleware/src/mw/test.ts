import { Provide } from '@midwayjs/decorator';
import * as assert from 'assert';

@Provide()
export class TestMiddleware {
  resolve() {
    return async (ctx, next) => {
      assert(ctx.logger);
      ctx.requestId = 555;
      await next();
    };
  }
}
