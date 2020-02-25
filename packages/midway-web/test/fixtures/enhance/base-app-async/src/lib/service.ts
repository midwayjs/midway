import { config, plugin } from '@midwayjs/decorator';
import { provide, async, init } from 'injection';


@async()
@provide()
export class BaseService {

  @config('hello')
  config;

  @plugin('plugin2')
  plugin2;

  @init()
  async init() {
    await new Promise((resolve) => {
      setTimeout(() => {
        this.config.c = 10;
        resolve();
      }, 100);
    });
  }

}
