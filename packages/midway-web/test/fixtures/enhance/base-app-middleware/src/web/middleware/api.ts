import { WebMiddleware } from '@midwayjs/decorator';
import { provide } from 'injection';
import { config } from 'midway-core';

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
