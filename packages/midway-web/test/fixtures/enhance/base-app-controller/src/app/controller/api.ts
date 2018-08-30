'use strict';

import { provide, ScopeEnum, scope } from 'injection';
import { Controller, controller, get } from '../../../../../../../src/';


@provide()
@scope(ScopeEnum.Request)
export class BaseApi extends Controller {
  async index() {
    this.ctx.body = 'index';
  }
}

@provide()
@controller('/api')
export class Api extends Controller {

  @get('/test')
  async index() {
    const {ctx} = this;
    ctx.body = 'hello';
  }
}
