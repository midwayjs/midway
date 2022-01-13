import { Middleware } from '@midwayjs/decorator';
import { BaseMiddleware } from './base';

@Middleware()
export class HSTSMiddleware extends BaseMiddleware {
  async compatibleMiddleware(req, res, next) {
    const result = await next();
    let val = 'max-age=' + this.security.hsts.maxAge;
    if (this.security.hsts.includeSubdomains) {
      val += '; includeSubdomains';
    }
    res.set('strict-transport-security', val);
    return result;
  }
}
