import { MidwayHttpError } from '@midwayjs/core';

export class BusinessError extends MidwayHttpError {
  code: string;

  constructor(message: string, code?: string) {
    super(message, 400);
    this.code = code || 'BUSINESS_ERROR';
  }
}

export class NotFoundError extends MidwayHttpError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class ValidationError extends MidwayHttpError {
  constructor(message: string) {
    super(message, 400);
  }
}
