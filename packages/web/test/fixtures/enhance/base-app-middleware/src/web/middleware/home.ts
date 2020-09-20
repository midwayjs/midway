import { provide, IWebMiddleware } from '../../../../../../../src';

@provide()
export class HomeMiddleware implements IWebMiddleware {

  resolve() {
    return async function (ctx, next) {
      ctx.home = '1111';
      await next();
    };
  }
}
