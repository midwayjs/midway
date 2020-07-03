import { FunctionHandler } from '../../../../src';
import { Func, Provide, App, Inject } from '@midwayjs/decorator';
import * as assert from 'assert';

@Provide()
@Func('index.handler')
export class HelloService implements FunctionHandler {
  @App()
  app;

  @Inject()
  loggerService;

  async handler() {
    assert(this.loggerService.getLogger());
    assert(this.loggerService.getLogger() === this.app.getLogger());
    return 'hello world';
  }
}
