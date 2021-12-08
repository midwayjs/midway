'use strict';

import { Inject, Provide, Scope, ScopeEnum, Controller, Get } from '@midwayjs/decorator';

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
    ctx.body = 'hello';
  }
}
