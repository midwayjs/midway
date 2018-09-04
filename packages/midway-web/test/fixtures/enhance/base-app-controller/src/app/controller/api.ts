'use strict';


import { inject, provide, scope, ScopeEnum } from 'injection';
import { controller, get } from '../../../../../../../src/';

const assert = require('assert');

@provide()
@scope(ScopeEnum.Request)
export class BaseApi {
  async index(ctx) {
    ctx.body = 'index';
  }
}

@provide()
@controller('/api')
export class Api {

  @inject()
  logger;

  @get('/test')
  async index(ctx) {
    assert(this.logger.constructor.name === 'ContextLogger');
    ctx.body = 'hello';
  }
}
