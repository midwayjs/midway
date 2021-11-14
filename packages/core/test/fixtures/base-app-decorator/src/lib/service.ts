import { Config, Plugin, Logger, Provide } from '@midwayjs/decorator';
@Provide()
export class BaseService {
  @Config('hello')
  config;

  @Plugin('plugin2')
  plugin2;

  @Logger()
  logger;
}
