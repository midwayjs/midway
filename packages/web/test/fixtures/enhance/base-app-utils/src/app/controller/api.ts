'use strict';

import { Inject, Provide, Config, Controller, Get } from '@midwayjs/decorator';

@Provide()
export class BaseApi {
  async index(ctx) {
    ctx.body = 'index';
  }
}

@Provide()
@Controller('/api')
export class Api {

  @Inject('is')
  isModule;

  @Config('hello')
  config1;

  @Get('/test')
  async index(ctx) {
    ctx.body = this.isModule.function('hello').toString() + this.config1.c;
  }
}
