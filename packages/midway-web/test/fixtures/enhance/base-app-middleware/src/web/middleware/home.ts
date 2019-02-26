import { provide } from 'injection';
import { WebMiddleware } from '@midwayjs/decorator';

@provide()
export class HomeMiddleware implements WebMiddleware {

  resolve() {
    return async function (ctx, next) {
      ctx.home = '1111';
      await next();
    };
  }
}
