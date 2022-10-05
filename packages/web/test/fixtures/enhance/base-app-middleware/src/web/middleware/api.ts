import { Config, Provide } from '@midwayjs/core';
import { IWebMiddleware } from '../../../../../../../src';

@Provide()
export class ApiMiddleware implements IWebMiddleware {

  @Config('hello')
  helloConfig;

  resolve() {
    return async (ctx, next) => {
      ctx.api = '222' + this.helloConfig.b;
      await next();
    };
  }

}
