'use strict';

import { Inject, Provide, Scope, ScopeEnum, Controller, Get } from '@midwayjs/decorator';

const assert = require('assert');

@Provide()
@Scope(ScopeEnum.Request)
export class BaseApi {
  async index(ctx) {
    ctx.body = 'index';
  }
}

@Provide()
@Controller('/components/')
export class Api {

  @Inject()
  logger;

  @Get('/')
  async index(ctx) {
    assert(this.logger.constructor.name === 'ContextLogger');
    ctx.body = 'hello';
  }
}
