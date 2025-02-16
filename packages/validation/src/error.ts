import { MidwayHttpError, registerErrorCode } from '@midwayjs/core';

const ValidateErrorCode = registerErrorCode('validate', {
  VALIDATE_FAIL: 10000,
  VALIDATOR_NOT_FOUND: 10001,
} as const);

export class MidwayValidationError extends MidwayHttpError {
  constructor(message, status, cause) {
    super(message, status, ValidateErrorCode.VALIDATE_FAIL, {
      cause,
    });
  }
}

export class MidwayValidatorNotFoundError extends MidwayHttpError {
  constructor(name: string, status: number, cause?: Error) {
    super(
      `validator ${name} not found`,
      status,
      ValidateErrorCode.VALIDATOR_NOT_FOUND,
      {
        cause,
      }
    );
  }
}
