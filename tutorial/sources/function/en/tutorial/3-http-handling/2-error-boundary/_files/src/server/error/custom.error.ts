import { MidwayHttpError } from '@midwayjs/core';

export class ValidationError extends MidwayHttpError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends MidwayHttpError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}
