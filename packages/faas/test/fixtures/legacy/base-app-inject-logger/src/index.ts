import { Provide, MainApp, Inject, Logger, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';
import * as assert from 'assert';

@Provide()
export class HelloService {
  @MainApp()
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

  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  async handler() {
    assert.ok(this.loggerService.getLogger());
    assert.ok(this.loggerService.getLogger() === this.app.getLogger());
    assert.ok(this.logger);
    assert.ok(this.logger === this.ctx.logger);
    assert.ok(this.logger === this.appLogger);
    assert.ok(this.logger === this.anotherLogger);
    assert.ok(this.logger === this.anotherAppLogger);
    return 'hello world';
  }
}
