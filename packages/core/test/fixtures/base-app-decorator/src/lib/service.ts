import { Config, Plugin, Logger, Provide, Async } from '@midwayjs/decorator';
@Async()
@Provide()
export class BaseService {
  @Config('hello')
  config;

  @Plugin('plugin2')
  plugin2;

  @Logger()
  logger;
}
