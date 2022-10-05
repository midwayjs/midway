import { Middleware } from '@midwayjs/core';
import { BaseMiddleware } from './base';

@Middleware()
export class NoOpenMiddleware extends BaseMiddleware {
  async compatibleMiddleware(context, req, res, next) {
    const result = await next();
    res.set('x-download-options', 'noopen');
    return result;
  }
}
