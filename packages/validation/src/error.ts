import { MidwayHttpError, registerErrorCode } from '@midwayjs/core';

const ValidateErrorCode = registerErrorCode('validate', {
  VALIDATE_FAIL: 10000,
  VALIDATE_STORE_NOT_SET: 10001,
} as const);

export class MidwayValidationError extends MidwayHttpError {
  constructor(message, status, cause) {
    super(message, status, ValidateErrorCode.VALIDATE_FAIL, {
      cause,
    });
  }
}

export class MidwayValidationStoreNotSetError extends MidwayHttpError {
  constructor() {
    super(
      'Validation store is not set',
      500,
      ValidateErrorCode.VALIDATE_STORE_NOT_SET
    );
  }
}
