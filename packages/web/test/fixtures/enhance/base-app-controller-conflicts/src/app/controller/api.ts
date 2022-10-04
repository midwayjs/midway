'use strict';

import { ScopeEnum } from '@midwayjs/core';
import {
  Controller,
  Get,
  Inject,
  Provide,
  Scope,
} from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Request)
export class BaseApi {
  async index(ctx) {
    ctx.body = 'index';
  }
}

@Provide()
@Controller('/components/')
export class My {
  @Inject()
  logger;

  @Get('/')
  async index(ctx) {
    ctx.body = 'hello';
  }
}
