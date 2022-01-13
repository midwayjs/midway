import { Middleware } from '@midwayjs/decorator';
import { BaseMiddleware } from './base';

@Middleware()
export class NoOpenMiddleware extends BaseMiddleware {
  async compatibleMiddleware(req, res, next) {
    const result = await next();
    res.set('x-download-options', 'noopen');
    return result;
  }
}
