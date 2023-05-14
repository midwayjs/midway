import { httpError, Middleware } from '@midwayjs/core';
import { BaseMiddleware } from './base';
import * as methods from 'methods';
import { METHODS_NOT_ALLOWED } from '../constants';

/**
 * https://www.owasp.org/index.php/Cross_Site_Tracing
 * http://jsperf.com/find-by-map-with-find-by-array
 */
@Middleware()
export class MethodNotAllowedMiddleware extends BaseMiddleware {
  private safeHttpMethodsMap = {};
  constructor() {
    super();
    for (const method of methods) {
      if (!METHODS_NOT_ALLOWED.includes(method)) {
        this.safeHttpMethodsMap[method.toUpperCase()] = true;
      }
    }
  }
  async compatibleMiddleware(context, req, res, next) {
    // ctx.method is upper case
    if (!this.safeHttpMethodsMap[context.method]) {
      throw new httpError.MethodNotAllowedError();
    }
    return next();
  }
  securityName() {
    return 'methodnoallow';
  }
}
