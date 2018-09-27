import {config, plugin} from '../../../../../src/decorators';
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

  @config('adapterName')
  adapterName;
  plugin2;

  @inject('adapterFactory')
  factory;

  @inject('otherFactory')
  other;

  @inject('otherFactory1')
  other1;

  adapter;

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
    this.adapter = await this.factory(this.adapterName);
  }

  async say() {
    const o = await this.other(this.adapterName);
    return o.say();
  }

  async sayError() {
    const o = await this.other1(this.adapterName);
    return o.say();
  }
}
