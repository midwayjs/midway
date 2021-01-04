import {Async, Provide, Init, Config, Plugin, Inject} from '@midwayjs/decorator';

@Async()
@Provide()
export class BaseService {
  @Inject()
  ctx;

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

  getData() {
    return this.plugin2.text + this.config.c;
  }

}
