'use strict';

import { ScopeEnum } from '@midwayjs/decorator';
import {
  Controller,
  Get,
  Inject,
  Provide,
  Scope,
} from '@midwayjs/decorator';

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
export class My {
  @Inject()
  logger;

  @Get('/')
  async index(ctx) {
    assert(this.logger.constructor.name === 'ContextLogger');
    ctx.body = 'hello';
  }
}
