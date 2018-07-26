'use strict';

import {provide} from 'injection';
import {controller, get} from '../../../../../../../src/';


@provide()
export class BaseApi {
  async index(ctx) {
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
