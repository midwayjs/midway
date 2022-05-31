import { Provide, App, Inject, Logger, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';
import * as assert from 'assert';

@Provide()
export class HelloService {
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

  @ServerlessTrigger(ServerlessTriggerType.EVENT)
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
