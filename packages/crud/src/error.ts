import {
  MidwayError,
  MidwayHttpError,
  registerErrorCode,
} from '@midwayjs/core';

const CrudErrorCode = registerErrorCode('crud', {
  CONFIG_INVALID: 10000,
  QUERY_INVALID: 10001,
  RESOURCE_NOT_FOUND: 10002,
  PERSISTENCE_FAILED: 10003,
  FEATURE_NOT_SUPPORTED: 10004,
} as const);

/**
 * Thrown when CRUD metadata or runtime bindings are invalid.
 */
export class CrudConfigError extends MidwayError {
  constructor(message: string) {
    super(message, CrudErrorCode.CONFIG_INVALID);
  }
}

/**
 * Thrown when a CRUD query cannot be parsed safely.
 */
export class CrudQueryError extends MidwayHttpError {
  constructor(message: string) {
    super(message, 400, CrudErrorCode.QUERY_INVALID);
  }
}

/**
 * Thrown when a CRUD resource cannot be found.
 */
export class CrudNotFoundError extends MidwayHttpError {
  constructor(message = 'Resource not found') {
    super(message, 404, CrudErrorCode.RESOURCE_NOT_FOUND);
  }
}

/**
 * Thrown when a persistence operation fails with a known database error.
 */
export class CrudPersistenceError extends MidwayHttpError {
  constructor(message: string, status = 409) {
    super(message, status, CrudErrorCode.PERSISTENCE_FAILED);
  }
}

/**
 * Thrown when a feature is configured but unsupported by the adapter.
 */
export class CrudFeatureNotSupportedError extends MidwayError {
  constructor(message: string) {
    super(message, CrudErrorCode.FEATURE_NOT_SUPPORTED);
  }
}
