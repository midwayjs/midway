import { BaseCrudService } from '../service';
import {
  CrudContext,
  CrudIdValue,
  CrudOptions,
  CrudPageResult,
  CrudQuery,
} from '../interface';
import {
  assertMikroSoftDeleteSupported,
  buildMikroFindOptions,
  buildMikroWhere,
  MikroLikeRepository,
  withMikroErrorMapping,
} from './utils';

/**
 * Default MikroORM CRUD adapter.
 */
export class MikroCrudService<T> extends BaseCrudService<T> {
  repo: MikroLikeRepository<T>;

  constructor(options?: CrudOptions) {
    super();
    if (options) {
      this.setCrudOptions(options);
    }
  }

  async list(query: CrudQuery, _ctx?: CrudContext): Promise<CrudPageResult<T>> {
    void _ctx;
    const repo = this.getRepo();
    const where = this.getScopedWhere(query);
    const [data, total] = await withMikroErrorMapping(() =>
      repo.findAndCount(where, buildMikroFindOptions(query))
    );
    return this.normalizePageResult(data, query.page, query.limit, total);
  }

  async findOne(id: CrudIdValue, _ctx?: CrudContext): Promise<T | null> {
    void _ctx;
    return withMikroErrorMapping(() =>
      this.getRepo().findOne(this.getIdWhere(id))
    );
  }

  async create(data: unknown, _ctx?: CrudContext): Promise<T> {
    void _ctx;
    const entity = this.getRepo().create(data as any);
    await withMikroErrorMapping(() => this.getRepo().persistAndFlush(entity));
    return entity;
  }

  async update(id: CrudIdValue, data: unknown, _ctx?: CrudContext): Promise<T> {
    void _ctx;
    const existing = this.assertEntityFound(await this.findOne(id));
    const entity = this.getRepo().assign(existing, data as any);
    await withMikroErrorMapping(() => this.getRepo().persistAndFlush(entity));
    return entity;
  }

  async replace(id: CrudIdValue, data: unknown, ctx?: CrudContext): Promise<T> {
    return this.update(id, data, ctx);
  }

  async delete(id: CrudIdValue, _ctx?: CrudContext): Promise<void> {
    void _ctx;
    const repo = this.getRepo();
    if (this.resolveDeleteMode() === 'soft') {
      assertMikroSoftDeleteSupported(repo);
      const existing = this.assertEntityFound(await this.findOne(id));
      repo.assign(existing, { deletedAt: new Date() } as any);
      await withMikroErrorMapping(() => repo.persistAndFlush(existing));
      return;
    }
    const affected = await withMikroErrorMapping(() =>
      repo.nativeDelete(this.getIdWhere(id))
    );
    if (!affected) {
      throw this.assertEntityFound(null);
    }
  }

  protected getRepo(): MikroLikeRepository<T> {
    if (!this.repo) {
      throw new Error('MikroCrudService requires "repo" to be assigned');
    }
    return this.repo;
  }

  protected getScopedWhere(query: CrudQuery): Record<string, any> {
    const where = buildMikroWhere(query, this.crudOptions);
    if (this.resolveDeleteMode() === 'soft') {
      assertMikroSoftDeleteSupported(this.getRepo());
      where.deletedAt = null;
    }
    return where;
  }

  protected getIdWhere(id: CrudIdValue): Record<string, any> {
    const where: Record<string, any> = {
      [this.getIdField()]: id,
    };
    if (this.resolveDeleteMode() === 'soft') {
      assertMikroSoftDeleteSupported(this.getRepo());
      where.deletedAt = null;
    }
    return where;
  }

  protected getIdField(): string {
    return this.crudOptions?.id ?? 'id';
  }
}
