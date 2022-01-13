import { Middleware } from '@midwayjs/decorator';
import { BaseMiddleware } from './base';

@Middleware()
export class XSSProtectionMiddleware extends BaseMiddleware {
  async compatibleMiddleware(req, res, next) {
    const result = await next();
    res.set('x-xss-protection', this.security.xssProtection.value);
    return result;
  }
}
