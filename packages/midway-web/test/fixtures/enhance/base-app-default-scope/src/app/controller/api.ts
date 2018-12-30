'use strict';

import { provide } from 'injection';
import { controller, get } from '../../../../../../../src/';
import * as assert from 'assert';

@provide()
export class BaseApi {
  async index(ctx) {
    assert(ctx.proxy.baseApi);
    const baseApi = await ctx.requestContext.getAsync('baseApi');
    assert(baseApi);
    ctx.body = 'index';
  }
}

@provide()
@controller('/api')
export class Api {

  @get('/test')
  async index(ctx) {
    ctx.body = 'hello';
  }
}
