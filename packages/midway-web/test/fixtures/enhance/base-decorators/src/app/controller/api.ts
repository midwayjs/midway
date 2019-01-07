'use strict';

import { provide, scope, ScopeEnum, decorators } from 'injection';

const count = decorators.get('count');

@provide()
@scope(ScopeEnum.Request)
export class BaseApi {
  @count()
  async index(ctx) {
    ctx.logger.info('hahahaha');
    ctx.body = 'index';
  }
}
