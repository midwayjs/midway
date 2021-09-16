import {
  Config,
  Plugin,
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
  config;

  @Config('adapterName')
  adapterName;

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

  @Config('hello') innerConfig;
  @Inject() a;
  @Inject() b;
  @Plugin('plugin2') plugin2;

  @Init()
  async init() {
    this.config = Object.assign(this.innerConfig, {
      c: this.a.config.c + this.b.config.c + this.innerConfig.c,
    });
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
