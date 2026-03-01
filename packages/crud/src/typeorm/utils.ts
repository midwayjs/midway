import {
  CrudFeatureNotSupportedError,
  CrudNotFoundError,
  CrudPersistenceError,
} from '../error';
import { CrudFilter, CrudOptions, CrudQuery } from '../interface';

export interface TypeOrmLikeQueryBuilder<T = any> {
  andWhere(query: string, params?: Record<string, unknown>): this;
  orWhere(query: string, params?: Record<string, unknown>): this;
  addOrderBy(query: string, order: 'ASC' | 'DESC'): this;
  leftJoinAndSelect(path: string, alias: string): this;
  skip(value: number): this;
  take(value: number): this;
  getManyAndCount(): Promise<[T[], number]>;
}

export interface TypeOrmLikeRepository<T = any> {
  metadata: {
    name?: string;
    tableName?: string;
    columns: Array<{ isDeleteDate?: boolean; propertyName?: string }>;
  };
  createQueryBuilder?(alias: string): TypeOrmLikeQueryBuilder<T>;
  findOne(options: any): Promise<T | null>;
  create(data: any): T;
  save(data: any): Promise<T>;
  merge(target: any, source: any): T;
  delete(criteria: any): Promise<unknown>;
  softDelete?(criteria: any): Promise<unknown>;
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

/**
 * Maps a CRUD filter to the closest TypeORM operator.
 */
export function mapCrudFilterToTypeOrmOperator(
  filter: CrudFilter
): { type: string; value: unknown } {
  switch (filter.operator) {
    case 'eq':
      return { type: 'Equal', value: filter.value };
    case 'ne':
      return { type: 'Not', value: filter.value };
    case 'gt':
      return { type: 'MoreThan', value: filter.value };
    case 'gte':
      return { type: 'MoreThanOrEqual', value: filter.value };
    case 'lt':
      return { type: 'LessThan', value: filter.value };
    case 'lte':
      return { type: 'LessThanOrEqual', value: filter.value };
    case 'in':
      return { type: 'In', value: String(filter.value).split(',').filter(Boolean) };
    case 'like':
      return { type: 'Like', value: `%${String(filter.value)}%` };
    default:
      return { type: 'Raw', value: filter.value };
  }
}

/**
 * Validates that a repository supports soft delete semantics.
 */
export function assertSoftDeleteSupported<T>(repo: TypeOrmLikeRepository<T>) {
  const supportsSoftDelete = repo.metadata.columns.some(
    column => column.isDeleteDate
  );
  if (!supportsSoftDelete) {
    throw new CrudFeatureNotSupportedError(
      'Soft delete requires a delete date column'
    );
  }
}

/**
 * Resolves the delete-date column name for soft-delete filtering.
 */
export function getSoftDeleteColumnName<T>(repo: TypeOrmLikeRepository<T>): string {
  const deleteDateColumn = repo.metadata.columns.find(column => column.isDeleteDate);
  if (!deleteDateColumn) {
    throw new CrudFeatureNotSupportedError(
      'Soft delete requires a delete date column'
    );
  }
  return deleteDateColumn.propertyName || 'deletedAt';
}

/**
 * Maps common persistence errors to stable CRUD errors.
 */
export function mapTypeOrmError(error: any): Error {
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
    return new CrudPersistenceError('Resource is referenced by another record', 409);
  }
  if (error.name === 'EntityNotFoundError') {
    return new CrudNotFoundError();
  }

  return error;
}

/**
 * Wraps repository calls and normalizes known database errors.
 */
export async function withTypeOrmErrorMapping<T>(
  factory: () => Promise<T>
): Promise<T> {
  try {
    return await factory();
  } catch (error) {
    throw mapTypeOrmError(error);
  }
}

function applyFilter<T>(
  qb: TypeOrmLikeQueryBuilder<T>,
  alias: string,
  filter: CrudFilter,
  index: number
) {
  const key = `crud_filter_${index}`;
  const column = `${alias}.${filter.field}`;
  switch (filter.operator) {
    case 'eq':
      qb.andWhere(`${column} = :${key}`, { [key]: filter.value });
      break;
    case 'ne':
      qb.andWhere(`${column} != :${key}`, { [key]: filter.value });
      break;
    case 'gt':
      qb.andWhere(`${column} > :${key}`, { [key]: filter.value });
      break;
    case 'gte':
      qb.andWhere(`${column} >= :${key}`, { [key]: filter.value });
      break;
    case 'lt':
      qb.andWhere(`${column} < :${key}`, { [key]: filter.value });
      break;
    case 'lte':
      qb.andWhere(`${column} <= :${key}`, { [key]: filter.value });
      break;
    case 'in':
      qb.andWhere(`${column} IN (:...${key})`, {
        [key]: String(filter.value).split(',').filter(Boolean),
      });
      break;
    case 'like':
      qb.andWhere(`${column} LIKE :${key}`, { [key]: `%${String(filter.value)}%` });
      break;
  }
}

/**
 * Applies CRUD query semantics to a TypeORM query builder.
 */
export function buildTypeOrmQueryBuilder<T>(
  repo: TypeOrmLikeRepository<T>,
  query: CrudQuery,
  options?: CrudOptions
): TypeOrmLikeQueryBuilder<T> {
  const alias =
    repo.metadata.tableName ||
    (repo.metadata.name ? repo.metadata.name.toLowerCase() : 'entity');
  if (!repo.createQueryBuilder) {
    throw new CrudFeatureNotSupportedError(
      'Repository must implement createQueryBuilder() for list queries'
    );
  }
  const qb = repo.createQueryBuilder(alias);

  if (options?.delete?.mode === 'soft') {
    const deleteDateField = getSoftDeleteColumnName(repo);
    qb.andWhere(`${alias}.${deleteDateField} IS NULL`);
  }

  (query.joins ?? []).forEach(join => {
    qb.leftJoinAndSelect(`${alias}.${join}`, join);
  });

  query.filters.forEach((filter, index) => applyFilter(qb, alias, filter, index));

  if (query.search && options?.query?.searchable?.length) {
    const searchable = options.query.searchable;
    const queryText = searchable
      .map((field, index) => `${alias}.${field} LIKE :crud_search_${index}`)
      .join(' OR ');
    const params = searchable.reduce((acc, field, index) => {
      acc[`crud_search_${index}`] = `%${query.search}%`;
      return acc;
    }, {} as Record<string, unknown>);
    qb.andWhere(`(${queryText})`, params);
  }

  query.sort.forEach(sort => {
    qb.addOrderBy(`${alias}.${sort.field}`, sort.order);
  });

  qb.skip((query.page - 1) * query.limit);
  qb.take(query.limit);

  return qb;
}
