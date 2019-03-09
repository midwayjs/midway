import { provide } from 'injection';
import { WebMiddleware } from '../../../../../../../src/interface';

@provide()
export class HomeMiddleware implements WebMiddleware {

  resolve() {
    return async function (ctx, next) {
      ctx.home = '1111';
      await next();
    };
  }
}
