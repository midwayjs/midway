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

  @Config('adapterName')
  adapterName;
  plugin2;

  @Inject('adapterFactory')
  factory;

  @Inject()
  contextHandler: () => boolean;

  adapter;

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
    this.adapter = await this.factory(this.adapterName);
    const data = await this.contextHandler();
    this.config.d = data ? 1 : 2;
  }

}
