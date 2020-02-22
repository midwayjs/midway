import { config, plugin } from '@midwayjs/decorator';

import { provide, async, init, inject } from 'injection';

@provide()
export class A {
  config = {
    c: 20,
  };
}

@provide()
export class B {
  config = {
    c: 40,
  };
}

@async()
@provide()
export class BaseService {

  config;
  plugin2;

  constructor(
  @inject() a,
    @config('hello') configInput,
    @inject() b,
    @plugin('plugin2') plugin2,
  ) {
    this.config = Object.assign(configInput, {
      c: a.config.c + b.config.c + configInput.c,
    });
    this.plugin2 = plugin2;
  }

  @init()
  async init() {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  }

}
