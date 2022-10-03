import { Config, Plugin, Logger, Provide } from '../../../../../src';
@Provide()
export class BaseService {
  @Config('hello')
  config;

  @Plugin('plugin2')
  plugin2;

  @Logger()
  logger;
}
