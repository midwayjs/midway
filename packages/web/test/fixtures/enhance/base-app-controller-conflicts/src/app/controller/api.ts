'use strict';

import { ScopeEnum } from '@midwayjs/decorator';
import {
  controller,
  get,
  inject,
  provide,
  scope,
} from '../../../../../../../src/';

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
export class My {
  @inject()
  logger;

  @get('/')
  async index(ctx) {
    assert(this.logger.constructor.name === 'ContextLogger');
    ctx.body = 'hello';
  }
}
