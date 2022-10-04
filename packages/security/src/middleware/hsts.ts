import { Middleware } from '@midwayjs/core';
import { BaseMiddleware } from './base';

@Middleware()
export class HSTSMiddleware extends BaseMiddleware {
  async compatibleMiddleware(context, req, res, next) {
    const result = await next();
    let val = 'max-age=' + this.security.hsts.maxAge;
    if (this.security.hsts.includeSubdomains) {
      val += '; includeSubdomains';
    }
    res.set('strict-transport-security', val);
    return result;
  }
}
