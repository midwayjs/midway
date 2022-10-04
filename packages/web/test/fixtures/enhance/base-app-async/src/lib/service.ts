import { Config, Init, Plugin, Provide } from '@midwayjs/core';

@Provide()
export class BaseService {

  @Config('hello')
  config;

  @Plugin('plugin2')
  plugin2;

  @Init()
  async init() {
    await new Promise<void>(resolve => {
      setTimeout(() => {
        this.config.c = 10;
        resolve();
      }, 100);
    });
  }

}
