import { Middleware } from '@midwayjs/decorator';
import { BaseMiddleware } from './base';

@Middleware()
export class NoSniffMiddleware extends BaseMiddleware {
  async compatibleMiddleware(req, res, next) {
    const result = await next();
    res.set('x-content-type-options', 'nosniff');
    return result;
  }
}
