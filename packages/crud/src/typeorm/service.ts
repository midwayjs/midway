import { BaseCrudService } from '../service';
import {
  assertSoftDeleteSupported,
  buildTypeOrmQueryBuilder,
  getSoftDeleteColumnName,
  TypeOrmLikeRepository,
  withTypeOrmErrorMapping,
} from './utils';
import {
  CrudContext,
  CrudIdValue,
  CrudOptions,
  CrudPageResult,
  CrudQuery,
} from '../interface';

/**
 * Default TypeORM CRUD adapter.
 */
export class TypeOrmCrudService<T> extends BaseCrudService<T> {
  repo: TypeOrmLikeRepository<T>;

  constructor(options?: CrudOptions) {
    super();
    if (options) {
      this.setCrudOptions(options);
    }
  }

  async list(query: CrudQuery, _ctx?: CrudContext): Promise<CrudPageResult<T>> {
    void _ctx;
    const repo = this.getRepo();
    if (this.resolveDeleteMode() === 'soft') {
      assertSoftDeleteSupported(repo);
    }
    const qb = buildTypeOrmQueryBuilder(repo, query, this.crudOptions);
    const [data, total] = await withTypeOrmErrorMapping(() =>
      qb.getManyAndCount()
    );
    return this.normalizePageResult(data, query.page, query.limit, total);
  }

  async findOne(id: CrudIdValue, _ctx?: CrudContext): Promise<T | null> {
    void _ctx;
    const repo = this.getRepo();
    const where: Record<string, unknown> = {};
    if (this.resolveDeleteMode() === 'soft') {
      assertSoftDeleteSupported(repo);
      where[getSoftDeleteColumnName(repo)] = null;
    }
    const idField = this.getIdField();
    where[idField] = id;
    return withTypeOrmErrorMapping(() =>
      repo.findOne({
        where: where as any,
      })
    );
  }

  async create(data: unknown, _ctx?: CrudContext): Promise<T> {
    void _ctx;
    const repo = this.getRepo();
    const entity = repo.create(data as any);
    return withTypeOrmErrorMapping(() => repo.save(entity));
  }

  async update(id: CrudIdValue, data: unknown, _ctx?: CrudContext): Promise<T> {
    void _ctx;
    const repo = this.getRepo();
    const idField = this.getIdField();
    const existing = this.assertEntityFound(
      await repo.findOne({
        where: {
          [idField]: id,
        } as any,
      })
    );
    const merged = repo.merge(existing as any, data as any);
    return withTypeOrmErrorMapping(() => repo.save(merged as any));
  }

  async replace(id: CrudIdValue, data: unknown, ctx?: CrudContext): Promise<T> {
    return this.update(id, data, ctx);
  }

  async delete(id: CrudIdValue, _ctx?: CrudContext): Promise<void> {
    void _ctx;
    const repo = this.getRepo();
    const idField = this.getIdField();
    if (this.resolveDeleteMode() === 'soft') {
      assertSoftDeleteSupported(repo);
      await withTypeOrmErrorMapping(() =>
        repo.softDelete({
          [idField]: id,
        } as any)
      );
      return;
    }
    await withTypeOrmErrorMapping(() =>
      repo.delete({
        [idField]: id,
      } as any)
    );
  }

  protected getRepo(): TypeOrmLikeRepository<T> {
    if (!this.repo) {
      throw new Error('TypeOrmCrudService requires "repo" to be assigned');
    }
    return this.repo;
  }

  protected getIdField(): string {
    return this.crudOptions?.id ?? 'id';
  }
}
