import {async, init, provide} from 'midway-context';
import {config, plugin} from 'midway-core';

@async()
@provide()
export class BaseService {

  @config('hello')
  config;

  @plugin('plugin2')
  plugin2;

  @init()
  async init() {
    await new Promise(resolve => {
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
