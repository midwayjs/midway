import { Provide, Plugin, Config, Logger } from '@midwayjs/decorator';
import * as assert from 'assert';

@Provide()
export class Report {

  @Plugin()
  custom;

  @Config()
  hello;

  @Logger()
  logger;

  resolve() {
    return async (ctx, next) => {
      assert(this.logger);
      ctx.text = this.custom['bbb'] + this.hello['a'];
      await next();
    };
  }
}
