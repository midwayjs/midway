import * as koaBodyParser from 'koa-bodyparser';
import { Config, Middleware } from '@midwayjs/core';

@Middleware()
export class BodyParserMiddleware {
  @Config('bodyParser')
  bodyparserConfig;

  resolve() {
    // use bodyparser middleware
    if (this.bodyparserConfig.enable) {
      return koaBodyParser(this.bodyparserConfig);
    }
  }

  static getName() {
    return 'bodyParser';
  }
}
