import {
  CrudFeatureNotSupportedError,
  CrudNotFoundError,
  CrudPersistenceError,
} from '../error';
import { CrudOptions, CrudQuery } from '../interface';

export interface MikroLikeRepository<T = any> {
  metadata?: {
    properties?: Record<string, unknown>;
  };
  findAndCount(where: any, options?: any): Promise<[T[], number]>;
  findOne(where: any, options?: any): Promise<T | null>;
  create(data: any): T;
  assign(entity: T, data: any): T;
  persistAndFlush(entity: T): Promise<void>;
  nativeDelete(where: any): Promise<number>;
}

const UNIQUE_CONSTRAINT_CODES = new Set([
  '23505',
  '1062',
  'SQLITE_CONSTRAINT',
  'SQLITE_CONSTRAINT_UNIQUE',
]);

const FOREIGN_KEY_CONSTRAINT_CODES = new Set([
  '23503',
  '1451',
  '1452',
  'SQLITE_CONSTRAINT_FOREIGNKEY',
]);

function buildMikroCondition(operator: string, value: unknown) {
  switch (operator) {
    case 'eq':
      return value;
    case 'ne':
      return { $ne: value };
    case 'gt':
      return { $gt: value };
    case 'gte':
      return { $gte: value };
    case 'lt':
      return { $lt: value };
    case 'lte':
      return { $lte: value };
    case 'in':
      return { $in: String(value).split(',').filter(Boolean) };
    case 'like':
      return { $like: `%${String(value)}%` };
    default:
      return value;
  }
}

/**
 * Builds a minimal MikroORM where payload from a CRUD query.
 */
export function buildMikroWhere(
  query: CrudQuery,
  options?: CrudOptions
): Record<string, any> {
  const where: Record<string, any> = {};

  for (const filter of query.filters) {
    where[filter.field] = buildMikroCondition(filter.operator, filter.value);
  }

  if (query.search && options?.query?.searchable?.length) {
    where.$or = options.query.searchable.map(field => ({
      [field]: {
        $like: `%${query.search}%`,
      },
    }));
  }

  return where;
}

/**
 * Converts CRUD query semantics into MikroORM-like find options.
 */
export function buildMikroFindOptions(query: CrudQuery): Record<string, any> {
  const findOptions: Record<string, any> = {
    limit: query.limit,
    offset: (query.page - 1) * query.limit,
  };

  if (query.sort.length) {
    findOptions.orderBy = query.sort.reduce(
      (acc, item) => {
        acc[item.field] = item.order;
        return acc;
      },
      {} as Record<string, 'ASC' | 'DESC'>
    );
  }

  if (query.joins?.length) {
    findOptions.populate = query.joins;
  }

  if (query.fields?.length) {
    findOptions.fields = query.fields;
  }

  return findOptions;
}

/**
 * Ensures the repository exposes the deletedAt property for soft delete.
 */
export function assertMikroSoftDeleteSupported<T>(
  repo: MikroLikeRepository<T>,
  field = 'deletedAt'
) {
  if (!repo?.metadata?.properties?.[field]) {
    throw new CrudFeatureNotSupportedError(
      `Soft delete requires a "${field}" property in MikroORM metadata`
    );
  }
}

/**
 * Maps common MikroORM persistence errors to stable CRUD errors.
 */
export function mapMikroError(error: any): Error {
  if (!error) {
    return error;
  }
  if (
    error instanceof CrudFeatureNotSupportedError ||
    error instanceof CrudNotFoundError ||
    error instanceof CrudPersistenceError
  ) {
    return error;
  }

  const code = String(error.code || '');
  if (UNIQUE_CONSTRAINT_CODES.has(code)) {
    return new CrudPersistenceError('Resource already exists', 409);
  }
  if (FOREIGN_KEY_CONSTRAINT_CODES.has(code)) {
    return new CrudPersistenceError(
      'Resource is referenced by another record',
      409
    );
  }
  if (error.name === 'NotFoundError') {
    return new CrudNotFoundError();
  }

  return error;
}

/**
 * Wraps MikroORM calls and normalizes known persistence errors.
 */
export async function withMikroErrorMapping<T>(
  factory: () => Promise<T>
): Promise<T> {
  try {
    return await factory();
  } catch (error) {
    throw mapMikroError(error);
  }
}
