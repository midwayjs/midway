import { config, plugin } from 'midway-core';
import { async, init, inject, provide } from 'injection';

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

  @inject()
  contextHandler: () => boolean;

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
    const data = await this.contextHandler();
    this.config.d = data ? 1 : 2;
  }

}
