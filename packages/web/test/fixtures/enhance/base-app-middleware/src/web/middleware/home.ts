import { Provide } from '@midwayjs/decorator';
import { IWebMiddleware } from '../../../../../../../src';

@Provide()
export class HomeMiddleware implements IWebMiddleware {

  resolve() {
    return async function (ctx, next) {
      ctx.home = '1111';
      await next();
    };
  }
}
