import { Config, Plugin, Logger, Provide, Async, App } from '@midwayjs/decorator';
import { IMidwayCoreApplication } from '../../../../../src';
@Async()
@Provide()
export class BaseService {
  @Config('hello')
  config;

  @Plugin('plugin2')
  plugin2;

  @Logger()
  logger;

  @App()
  test: IMidwayCoreApplication;
}
