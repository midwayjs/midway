import {
  MidwayError,
  MidwayHttpError,
  registerErrorCode,
} from '@midwayjs/core';

const ValidateErrorCode = registerErrorCode('validate', {
  VALIDATE_FAIL: 10000,
  PROPERTY_MISSING: 10001,
  NOT_METHOD_PROPERTY: 10002,
} as const);

export class MidwayValidationError extends MidwayHttpError {
  constructor(message, status, cause) {
    super(message, status, ValidateErrorCode.VALIDATE_FAIL, {
      cause,
    });
  }
}

export class ValidationPropertyMissingError extends MidwayError {
  constructor(key) {
    super(
      `Cannot find property of "${key}"`,
      ValidateErrorCode.PROPERTY_MISSING
    );
  }
}

export class ValidationNotMethodPropertyError extends MidwayError {
  constructor(key) {
    super(
      `"${key}" is not a method property!`,
      ValidateErrorCode.NOT_METHOD_PROPERTY
    );
  }
}
