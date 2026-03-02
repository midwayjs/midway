import {
  CrudFeatureNotSupportedError,
  CrudNotFoundError,
  CrudPersistenceError,
} from '../error';
import { CrudFilter, CrudOptions, CrudQuery } from '../interface';

export interface MongooseLikeQuery<T = any> {
  sort(value: any): this;
  skip(value: number): this;
  limit(value: number): this;
  populate(path: string): this;
  select(value: any): this;
  exec(): Promise<T>;
}

export interface MongooseLikeModel<T = any> {
  schema?: {
    paths?: Record<string, unknown>;
  };
  find(filter: any): MongooseLikeQuery<T[]>;
  findOne(filter: any): Promise<T | null>;
  countDocuments(filter: any): Promise<number>;
  create(data: any): Promise<T>;
  findOneAndUpdate(filter: any, data: any, options?: any): Promise<T | null>;
  deleteOne(filter: any): Promise<{ deletedCount?: number }>;
}

function buildFilterValue(filter: CrudFilter) {
  switch (filter.operator) {
    case 'eq':
      return filter.value;
    case 'ne':
      return { $ne: filter.value };
    case 'gt':
      return { $gt: filter.value };
    case 'gte':
      return { $gte: filter.value };
    case 'lt':
      return { $lt: filter.value };
    case 'lte':
      return { $lte: filter.value };
    case 'in':
      return { $in: String(filter.value).split(',').filter(Boolean) };
    case 'like':
      return { $regex: String(filter.value), $options: 'i' };
  }
}

/**
 * Builds a minimal Mongoose filter from CRUD query options.
 */
export function buildMongooseFilter(
  query: CrudQuery,
  options?: CrudOptions
): Record<string, any> {
  const filter: Record<string, any> = {};

  for (const item of query.filters) {
    filter[item.field] = buildFilterValue(item);
  }

  if (query.search && options?.query?.searchable?.length) {
    filter.$or = options.query.searchable.map(field => ({
      [field]: {
        $regex: query.search,
        $options: 'i',
      },
    }));
  }

  return filter;
}

/**
 * Ensures the Mongoose model supports the default soft-delete field.
 */
export function assertMongooseSoftDeleteSupported(
  model: MongooseLikeModel<any>,
  field = 'deletedAt'
) {
  if (!model?.schema?.paths?.[field]) {
    throw new CrudFeatureNotSupportedError(
      `Soft delete requires a "${field}" field on the Mongoose schema`
    );
  }
}

/**
 * Normalizes common Mongoose persistence errors.
 */
export function mapMongooseError(error: any): Error {
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
  if (error.code === 11000) {
    return new CrudPersistenceError('Resource already exists', 409);
  }
  if (error.name === 'DocumentNotFoundError') {
    return new CrudNotFoundError();
  }
  return error;
}

/**
 * Wraps Mongoose calls and normalizes known persistence errors.
 */
export async function withMongooseErrorMapping<T>(
  factory: () => Promise<T>
): Promise<T> {
  try {
    return await factory();
  } catch (error) {
    throw mapMongooseError(error);
  }
}
