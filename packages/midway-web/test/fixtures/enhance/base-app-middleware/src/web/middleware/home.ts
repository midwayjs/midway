import { provide, WebMiddleware } from '../../../../../../../src';

@provide()
export class HomeMiddleware implements WebMiddleware {

  resolve() {
    return async function (ctx, next) {
      ctx.home = '1111';
      await next();
    };
  }
}
