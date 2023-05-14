import { httpError } from '@midwayjs/core';

// csrf 403
export class CSRFError extends httpError.ForbiddenError {
  constructor(message?) {
    super(message || 'csrf error');
  }
}

export class ReferrerPolicyNotAllowedError extends httpError.InternalServerErrorError {
  constructor(policy) {
    super(`Current policy ${policy} not allowed`);
  }
}
