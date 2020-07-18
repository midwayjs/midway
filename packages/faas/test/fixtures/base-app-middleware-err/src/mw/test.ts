import { Provide } from '@midwayjs/decorator';
import * as assert from 'assert';

@Provide()
export class TestMiddleware {
  resolve() {
    return async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        assert(err);
      }
    };
  }
}
