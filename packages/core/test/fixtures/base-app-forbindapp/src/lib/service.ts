import { Config, Plugin, Logger, Provide, App } from '../../../../../src';
import { IMidwayApplication } from '../../../../../src';

@Provide()
export class BaseService {
  @Config('hello')
  config;

  @Plugin('plugin2')
  plugin2;

  @Logger()
  logger;

  @App()
  test: IMidwayApplication;
}
