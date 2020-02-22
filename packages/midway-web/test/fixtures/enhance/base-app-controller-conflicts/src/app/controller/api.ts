'use strict';

import * as assert from 'assert';

import { inject, provide, scope, ScopeEnum } from 'injection';

// eslint-disable-next-line import/named
import { controller, get } from '../../../../../../../src';


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
