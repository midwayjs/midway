import { inject, provide, func, FunctionHandler } from '../../../../src';
import { Plugin, App } from '@midwayjs/decorator';
import * as assert from 'assert';

@provide()
@func('index.handler')
export class HelloService implements FunctionHandler {
  @inject()
  ctx; // context

  @App()
  app;

  @Plugin()
  mysql;

  handler(event) {
    assert(this.app);
    return this.ctx.originContext['text'] + event.text + this.mysql.model;
  }
}
