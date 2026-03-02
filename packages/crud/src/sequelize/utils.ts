import {
  CrudFeatureNotSupportedError,
  CrudNotFoundError,
  CrudPersistenceError,
} from '../error';
import { CrudFilter, CrudOptions, CrudQuery } from '../interface';

export interface SequelizeLikeModel<T = any> {
  options?: {
    paranoid?: boolean;
  };
  findAndCountAll(options: any): Promise<{ rows: T[]; count: number }>;
  findByPk(id: unknown, options?: any): Promise<T | null>;
  create(data: any): Promise<T>;
  update(data: any, options: any): Promise<[number] | [number, T[]]>;
  destroy(options: any): Promise<number>;
}

const UNIQUE_CONSTRAINT_NAMES = new Set(['SequelizeUniqueConstraintError']);

const FOREIGN_KEY_CONSTRAINT_NAMES = new Set([
  'SequelizeForeignKeyConstraintError',
]);

function mapFilterValue(filter: CrudFilter) {
  switch (filter.operator) {
    case 'in':
      return String(filter.value).split(',').filter(Boolean);
    case 'like':
      return `%${String(filter.value)}%`;
    default:
      return filter.value;
  }
}

/**
 * Maps CRUD filters to a minimal Sequelize-like where descriptor.
 */
export function buildSequelizeWhere(
  query: CrudQuery,
  options?: CrudOptions
): Record<string, any> {
  const where: Record<string, any> = {};

  for (const filter of query.filters) {
    const current = where[filter.field] || {};
    switch (filter.operator) {
      case 'eq':
        where[filter.field] = mapFilterValue(filter);
        break;
      case 'ne':
        where[filter.field] = { ...current, ne: mapFilterValue(filter) };
        break;
      case 'gt':
        where[filter.field] = { ...current, gt: mapFilterValue(filter) };
        break;
      case 'gte':
        where[filter.field] = { ...current, gte: mapFilterValue(filter) };
        break;
      case 'lt':
        where[filter.field] = { ...current, lt: mapFilterValue(filter) };
        break;
      case 'lte':
        where[filter.field] = { ...current, lte: mapFilterValue(filter) };
        break;
      case 'in':
        where[filter.field] = { ...current, in: mapFilterValue(filter) };
        break;
      case 'like':
        where[filter.field] = { ...current, like: mapFilterValue(filter) };
        break;
    }
  }

  if (query.search && options?.query?.searchable?.length) {
    where.or = options.query.searchable.map(field => ({
      [field]: {
        like: `%${query.search}%`,
      },
    }));
  }

  return where;
}

/**
 * Converts CRUD query semantics to a Sequelize-like findAndCountAll payload.
 */
export function buildSequelizeFindOptions(
  query: CrudQuery,
  options?: CrudOptions
): Record<string, any> {
  const findOptions: Record<string, any> = {
    where: buildSequelizeWhere(query, options),
    limit: query.limit,
    offset: (query.page - 1) * query.limit,
  };

  if (query.sort.length) {
    findOptions.order = query.sort.map(item => [item.field, item.order]);
  }

  if (query.joins?.length) {
    findOptions.include = query.joins.map(name => ({
      association: name,
    }));
  }

  if (query.fields?.length) {
    findOptions.attributes = query.fields;
  }

  return findOptions;
}

/**
 * Ensures the Sequelize model supports paranoid soft delete.
 */
export function assertSequelizeSoftDeleteSupported(
  model: SequelizeLikeModel<any>
) {
  if (!model?.options?.paranoid) {
    throw new CrudFeatureNotSupportedError(
      'Soft delete requires a paranoid Sequelize model'
    );
  }
}

/**
 * Maps common Sequelize persistence errors to stable CRUD errors.
 */
export function mapSequelizeError(error: any): Error {
  if (!error) {
    return error;
  }
  if (
    error instanceof CrudNotFoundError ||
    error instanceof CrudPersistenceError
  ) {
    return error;
  }

  if (UNIQUE_CONSTRAINT_NAMES.has(error.name)) {
    return new CrudPersistenceError('Resource already exists', 409);
  }
  if (FOREIGN_KEY_CONSTRAINT_NAMES.has(error.name)) {
    return new CrudPersistenceError(
      'Resource is referenced by another record',
      409
    );
  }

  return error;
}

/**
 * Wraps Sequelize calls and normalizes known persistence errors.
 */
export async function withSequelizeErrorMapping<T>(
  factory: () => Promise<T>
): Promise<T> {
  try {
    return await factory();
  } catch (error) {
    throw mapSequelizeError(error);
  }
}
