import { provide } from 'injection';
import { WebMiddleware } from '@midwayjs/decorator';

@provide()
export class ApiMiddleware implements WebMiddleware {

  resolve() {
    return async (ctx, next) => {
      ctx.api = '222';
      await next();
    };
  }

}
