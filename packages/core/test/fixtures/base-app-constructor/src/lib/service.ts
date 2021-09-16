import {
  Config,
  Plugin,
  Logger,
  Provide,
  Init,
  Inject,
} from '@midwayjs/decorator';

@Provide()
export class A {
  config = {
    c: 20,
  };
}

@Provide()
export class B {
  config = {
    c: 40,
  };
}

@Provide()
export class BaseService {

  @Inject() a;

  @Config('hello') innerConfig;

  @Inject() b;

  @Plugin('plugin2') plugin2;

  @Logger() logger;

  config;

  @Init()
  async init() {
    this.config = Object.assign(this.innerConfig, {
      c: this.a.config.c + this.b.config.c + this.innerConfig.c,
    });
    await new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  }
}
