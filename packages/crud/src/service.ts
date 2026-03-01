import {
  CRUD_DEFAULT_DELETE_MODE,
  CRUD_DEFAULT_LIMIT,
} from './constants';
import {
  CrudFeatureNotSupportedError,
  CrudNotFoundError,
} from './error';
import {
  CrudContext,
  CrudIdValue,
  CrudOptions,
  CrudPageMeta,
  CrudPageResult,
  CrudQuery,
  CrudService,
} from './interface';

/**
 * Shared helpers for adapter implementations.
 */
export abstract class BaseCrudService<T> implements CrudService<T> {
  protected crudOptions?: CrudOptions;

  setCrudOptions(options: CrudOptions) {
    this.crudOptions = options;
  }

  abstract list(query: CrudQuery, ctx?: CrudContext): Promise<CrudPageResult<T>>;

  abstract findOne(id: CrudIdValue, ctx?: CrudContext): Promise<T | null>;

  abstract create(data: unknown, ctx?: CrudContext): Promise<T>;

  abstract update(id: CrudIdValue, data: unknown, ctx?: CrudContext): Promise<T>;

  async replace(id: CrudIdValue, data: unknown, ctx?: CrudContext): Promise<T> {
    return this.update(id, data, ctx);
  }

  abstract delete(id: CrudIdValue, ctx?: CrudContext): Promise<void>;

  protected normalizePageMeta(
    page: number,
    limit: number,
    total: number
  ): CrudPageMeta {
    const safeLimit = limit > 0 ? limit : CRUD_DEFAULT_LIMIT;
    const pageCount = Math.ceil(total / safeLimit) || 1;
    return {
      page,
      limit: safeLimit,
      total,
      pageCount,
      hasNext: page < pageCount,
      hasPrev: page > 1,
    };
  }

  protected normalizePageResult(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): CrudPageResult<T> {
    return {
      data,
      meta: this.normalizePageMeta(page, limit, total),
    };
  }

  protected assertEntityFound<R>(entity: R | null, message = 'Resource not found'): R {
    if (!entity) {
      throw new CrudNotFoundError(message);
    }
    return entity;
  }

  protected resolveDeleteMode(): 'hard' | 'soft' {
    return this.crudOptions?.delete?.mode ?? CRUD_DEFAULT_DELETE_MODE;
  }

  protected assertSoftDeleteSupported(supported: boolean) {
    if (!supported) {
      throw new CrudFeatureNotSupportedError(
        'Soft delete is enabled but the adapter or entity does not support it'
      );
    }
  }
}
