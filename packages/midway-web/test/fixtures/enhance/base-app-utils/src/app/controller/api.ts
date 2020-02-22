'use strict';

import { controller, get, config } from '@midwayjs/decorator';

import { inject, provide } from 'injection';

@provide()
export class BaseApi {
  async index(ctx) {
    ctx.body = 'index';
  }
}

@provide()
@controller('/api')
export class Api {

  @inject('is')
  isModule;

  @config('hello')
  config1;

  @get('/test')
  async index(ctx) {
    ctx.body = this.isModule.function('hello').toString() + this.config1.c;
  }
}
