import { Config, Init, Inject, Plugin, Provide } from '@midwayjs/decorator';

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

@Provide()
export class BaseService {

  @Config('adapterName')
  adapterName;

  @Inject('adapterFactory')
  factory;

  @Inject()
  contextHandler: () => boolean;

  adapter;

  @Inject() a;
  @Config('hello') config;
  @Inject() b;
  @Plugin('plugin2') plugin2;

  otherConfig;

  @Init()
  async init() {
    this.otherConfig = Object.assign(this.config, {
      c: this.a.config.c + this.b.config.c + this.config.c
    });
    this.adapter = await this.factory(this.adapterName);
    const data = await this.contextHandler();
    this.config.d = data ? 1 : 2;
  }

}
