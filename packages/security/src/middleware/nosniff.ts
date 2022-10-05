import { Middleware } from '@midwayjs/core';
import { BaseMiddleware } from './base';

@Middleware()
export class NoSniffMiddleware extends BaseMiddleware {
  async compatibleMiddleware(context, req, res, next) {
    const result = await next();
    if (res.status >= 300 && res.status <= 308) {
      return result;
    }
    res.set('x-content-type-options', 'nosniff');
    return result;
  }
}
