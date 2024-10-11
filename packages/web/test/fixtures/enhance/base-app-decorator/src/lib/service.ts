import { Config, Plugin, Provide } from '@midwayjs/core';

@Provide()
export class BaseService {

  @Config('hello')
  config;

  @Plugin('plugin2')
  plugin2;

  async doStages(): Promise<string> {
    return 'success';
  }
}
