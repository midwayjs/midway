import { Async, Config, Init, Plugin, Provide } from '@midwayjs/decorator';

@Async()
@Provide()
export class BaseService {

  @Config('hello')
  config;

  @Plugin('plugin2')
  plugin2;

  @Init()
  async init() {
    await new Promise(resolve => {
      setTimeout(() => {
        this.config.c = 10;
        resolve();
      }, 100);
    });
  }

}
