import { MidwayHttpError, registerErrorCode } from '@midwayjs/core';

const ValidateErrorCode = registerErrorCode('validate', {
  VALIDATE_FAIL: 10000,
} as const);

export class MidwayValidationError extends MidwayHttpError {
  constructor(message, status, cause) {
    super(message, status, ValidateErrorCode.VALIDATE_FAIL, {
      cause,
    });
  }
}
