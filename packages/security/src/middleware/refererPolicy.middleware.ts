import { Middleware } from '@midwayjs/core';
import { BaseMiddleware } from './base';
import { ALLOWED_POLICIES_ENUM } from '../constants';
import { ReferrerPolicyNotAllowedError } from '../error';

@Middleware()
export class ReferrerPolicyMiddleware extends BaseMiddleware {
  async compatibleMiddleware(context, req, res, next) {
    const result = await next();
    const opts = this.getSecurityPolicyConfig();
    const policy = opts.value;
    if (!ALLOWED_POLICIES_ENUM.includes(policy)) {
      throw new ReferrerPolicyNotAllowedError(policy);
    }

    res.set('referrer-policy', policy);
    return result;
  }
  securityName() {
    return 'referrerPolicy';
  }
}
