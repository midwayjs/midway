/**
 * Metadata key for CRUD class options.
 */
export const CRUD_KEY = 'midway:crud';

/**
 * Default property name that stores CRUD service in controllers.
 */
export const CRUD_SERVICE_KEY = 'crudService';

/**
 * Default pagination limit used when route options omit one.
 */
export const CRUD_DEFAULT_LIMIT = 20;

/**
 * Upper limit for page size when route options omit one.
 */
export const CRUD_MAX_LIMIT = 100;

/**
 * Default delete mode for resources.
 */
export const CRUD_DEFAULT_DELETE_MODE = 'hard';

/**
 * Supported filter operators in phase 1.
 */
export const CRUD_ALLOWED_FILTER_OPERATORS = [
  'eq',
  'ne',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'like',
] as const;
