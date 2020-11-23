import { Async, Config, Init, Inject, Plugin, Provide } from '@midwayjs/decorator';

@Provide()
export class A {
  config = {
    c: 20
  };
}

@Provide()
export class B {
  config = {
    c: 40
  };
}

@Async()
@Provide()
export class BaseService {

  config;
  plugin2;

  constructor(
    @Inject() a,
    @Config('hello') config,
    @Inject() b,
    @Plugin('plugin2') plugin2
  ) {
    this.config = Object.assign(config, {
      c: a.config.c + b.config.c + config.c
    });
    this.plugin2 = plugin2;
  }

  @Init()
  async init() {
    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  }

}
