'use strict';

import {provide} from 'midway-context';
import {controller, get} from '../../../../../../src/';


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
