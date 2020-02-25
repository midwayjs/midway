import { config } from '@midwayjs/decorator';
import { provide } from 'injection';

import { WebMiddleware } from '../../../../../../../src';


@provide()
export class ApiMiddleware implements WebMiddleware {

  @config('hello')
  helloConfig;

  resolve() {
    return async (ctx, next) => {
      ctx.api = '222' + this.helloConfig.b;
      await next();
    };
  }

}
