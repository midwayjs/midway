'use strict';

import {inject, provide} from 'injection';
import {Controller, controller, get} from '../../../../../../../src/';
import {config} from 'midway-core';

@provide()
export class BaseApi {
  async index(ctx) {
    ctx.body = 'index';
  }
}

@provide()
@controller('/api')
export class Api extends Controller {

  @inject('is')
  isModule;

  @config('hello')
  config1;

  @get('/test')
  async index() {
    this.ctx.body = this.isModule.function('hello').toString() + this.config1.c;
  }
}
