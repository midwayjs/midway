/**
 * Thrown when CRUD metadata or runtime bindings are invalid.
 */
export class CrudConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CrudConfigError';
  }
}

/**
 * Thrown when a CRUD query cannot be parsed safely.
 */
export class CrudQueryError extends Error {
  status = 400;

  constructor(message: string) {
    super(message);
    this.name = 'CrudQueryError';
  }
}

/**
 * Thrown when a CRUD resource cannot be found.
 */
export class CrudNotFoundError extends Error {
  status = 404;

  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'CrudNotFoundError';
  }
}

/**
 * Thrown when a persistence operation fails with a known database error.
 */
export class CrudPersistenceError extends Error {
  status: number;

  constructor(message: string, status = 409) {
    super(message);
    this.name = 'CrudPersistenceError';
    this.status = status;
  }
}

/**
 * Thrown when a feature is configured but unsupported by the adapter.
 */
export class CrudFeatureNotSupportedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CrudFeatureNotSupportedError';
  }
}
