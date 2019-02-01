import {config, plugin} from 'midway-core';
import {provide, async, init, inject} from 'injection';

@provide()
export class A {
  config = {
    c: 20
  };
}

@provide()
export class B {
  config = {
    c: 40
  };
}

@async()
@provide()
export class BaseService {

  config;
  plugin2;

  constructor(
    @inject() a,
    @config('hello') config,
    @inject() b,
    @plugin('plugin2') plugin2
  ) {
    this.config = Object.assign(config, {
      c: a.config.c + b.config.c + config.c
    });
    this.plugin2 = plugin2;
  }

  @init()
  async init() {
    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  }

}
