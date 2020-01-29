import {
  Config,
  Plugin,
  Provide,
  Async,
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

@Async()
@Provide()
export class BaseService {
  config;

  @Config('adapterName')
  adapterName;
  plugin2;

  @Inject('adapterFactory')
  factory;

  @Inject('otherFactory')
  other;

  @Inject('otherFactory1')
  other1;
  @Inject('otherFactory2')
  other2;
  @Inject('otherFactory3')
  other3;
  adapter;

  constructor(
    @Inject() a,
    @Config('hello') config,
    @Inject() b,
    @Plugin('plugin2') plugin2
  ) {
    this.config = Object.assign(config, {
      c: a.config.c + b.config.c + config.c,
    });
    this.plugin2 = plugin2;
  }

  @Init()
  async init() {
    this.adapter = await this.factory(this.adapterName);
  }

  async say() {
    const o = await this.other(this.adapterName);
    return o.say();
  }

  async sayAuto() {
    try {
      const o2 = await this.other2('ttt');
      await o2.say();
    } catch (e) {
      console.log('function inject is not support!', e.stack);
    }

    const o3 = await this.other3;
    await o3.say();

    const o = await this.other1.say();
    return o;
  }
}
