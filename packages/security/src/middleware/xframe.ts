import { Middleware } from '@midwayjs/core';
import { BaseMiddleware } from './base';

@Middleware()
export class XFrameMiddleware extends BaseMiddleware {
  async compatibleMiddleware(context, req, res, next) {
    const result = await next();
    const value = this.security.xframe?.value || 'SAMEORIGIN';
    res.set('x-frame-options', value);
    return result;
  }
}
