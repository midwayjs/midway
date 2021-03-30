import { FunctionHandler } from '../../../../src';
import { Func, Provide, App, Inject, Logger } from '@midwayjs/decorator';
import * as assert from 'assert';

@Provide()
@Func('index.handler')
export class HelloService implements FunctionHandler {
  @App()
  app;

  @Inject()
  loggerService;

  @Inject()
  logger;

  @Inject()
  ctx;

  @Logger('logger')
  anotherLogger;

  @Logger('appLogger')
  anotherAppLogger;

  @Logger()
  appLogger;

  async handler() {
    assert(this.loggerService.getLogger());
    assert(this.loggerService.getLogger() === this.app.getLogger());
    assert(this.logger);
    assert(this.logger === this.ctx.logger);
    assert(this.logger === this.appLogger);
    assert(this.logger === this.anotherLogger);
    assert(this.logger === this.anotherAppLogger);
    return 'hello world';
  }
}
