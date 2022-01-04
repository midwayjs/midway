import { httpError } from '@midwayjs/core';

// csrf 403
export class JSONPCSRFError extends httpError.ForbiddenError {
  constructor() {
    super('jsonp request security validate failed');
  }
}
