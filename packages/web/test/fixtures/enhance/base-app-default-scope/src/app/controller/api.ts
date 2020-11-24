'use strict';

import { Controller, Get, Provide } from '@midwayjs/decorator';
import * as assert from 'assert';

@Provide()
export class BaseApi {
  async index(ctx) {
    const baseApi = await ctx.requestContext.getAsync('baseApi');
    assert(baseApi);
    ctx.body = 'index';
  }
}

@Provide()
@Controller('/api')
export class Api {

  @Get('/test')
  async index(ctx) {
    ctx.body = 'hello';
  }
}
