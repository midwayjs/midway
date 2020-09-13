import { Config, Plugin, Logger, Provide, Inject } from '@midwayjs/decorator';

@Provide()
export class BaseService {
  @Inject()
  ctx;

  @Config('hello')
  config;

  @Plugin('plugin2')
  plugin2;

  @Inject('is')
  isModule;

  @Logger()
  logger;

  async getData() {
    return this.isModule.function('hello').toString() + this.config.c;
  }
}
