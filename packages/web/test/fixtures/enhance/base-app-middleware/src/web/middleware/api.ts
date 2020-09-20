import { config, provide, IWebMiddleware } from '../../../../../../../src';

@provide()
export class ApiMiddleware implements IWebMiddleware {

  @config('hello')
  helloConfig;

  resolve() {
    return async (ctx, next) => {
      ctx.api = '222' + this.helloConfig.b;
      await next();
    };
  }

}
