import { Provide } from '@midwayjs/decorator';
import { FaaSContext, IMiddleware } from '../../../../../src';

@Provide('auth')
export class AuthMiddleware implements IMiddleware<FaaSContext> {
  resolve() {
    return async (ctx, next) => {
      ctx.text = 'hello';
      await next();
    };
  }
}
