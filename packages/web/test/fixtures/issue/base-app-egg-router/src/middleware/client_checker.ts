import { Provide } from '@midwayjs/decorator';
import { IWebMiddleware, IMidwayWebNext } from '../../../../../../src';
import { Context } from 'egg';

@Provide()
export class ClientCheckerMiddleware implements IWebMiddleware {
  resolve() {
    return async (ctx: Context, next: IMidwayWebNext) => {
      console.log('运行了 ClientCheckerMiddleware');
      ctx.test = '来自 ClientCheckerMiddleware 的值';
      await next();
    };
  }
}
