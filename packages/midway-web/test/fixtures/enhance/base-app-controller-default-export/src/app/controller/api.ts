'use strict';

import { inject, provide, scope, ScopeEnum, controller, get } from '../../../../../../../src/';

const assert = require('assert');

@provide()
@scope(ScopeEnum.Request)
export class BaseApi {
  async index(ctx) {
    ctx.body = 'index';
  }
}

@provide()
@controller('/components/')
export class Api {

  @inject()
  logger;

  @get('/')
  async index(ctx) {
    assert(this.logger.constructor.name === 'ContextLogger');
    ctx.body = 'hello';
  }
}
