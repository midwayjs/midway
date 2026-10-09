import { BaseCrudService } from '../service';
import {
  CrudContext,
  CrudIdValue,
  CrudOptions,
  CrudPageResult,
  CrudQuery,
} from '../interface';
import {
  assertSequelizeSoftDeleteSupported,
  buildSequelizeFindOptions,
  SequelizeLikeModel,
  withSequelizeErrorMapping,
} from './utils';

/**
 * Default Sequelize CRUD adapter.
 */
export class SequelizeCrudService<T> extends BaseCrudService<T> {
  repo: SequelizeLikeModel<T>;

  constructor(options?: CrudOptions) {
    super();
    if (options) {
      this.setCrudOptions(options);
    }
  }

  async list(query: CrudQuery, ctx?: CrudContext): Promise<CrudPageResult<T>> {
    const repo = this.getRepo();
    if (this.resolveDeleteMode(ctx) === 'soft') {
      assertSequelizeSoftDeleteSupported(repo);
    }
    const result = await withSequelizeErrorMapping(() =>
      repo.findAndCountAll(
        buildSequelizeFindOptions(query, this.resolveCrudOptions(ctx))
      )
    );
    return this.normalizePageResult(
      result.rows,
      query.page,
      query.limit,
      result.count
    );
  }

  async findOne(id: CrudIdValue, ctx?: CrudContext): Promise<T | null> {
    const repo = this.getRepo();
    if (this.resolveDeleteMode(ctx) === 'soft') {
      assertSequelizeSoftDeleteSupported(repo);
    }
    return withSequelizeErrorMapping(() => repo.findByPk(id));
  }

  async create(data: unknown, _ctx?: CrudContext): Promise<T> {
    void _ctx;
    return withSequelizeErrorMapping(() => this.getRepo().create(data as any));
  }

  async update(id: CrudIdValue, data: unknown, ctx?: CrudContext): Promise<T> {
    const repo = this.getRepo();
    const [count] = await withSequelizeErrorMapping(() =>
      repo.update(data as any, {
        where: {
          [this.getIdField(ctx)]: id,
        },
      })
    );
    if (!count) {
      throw this.assertEntityFound(null);
    }
    return this.assertEntityFound(await this.findOne(id, ctx));
  }

  async replace(id: CrudIdValue, data: unknown, ctx?: CrudContext): Promise<T> {
    return this.update(id, data, ctx);
  }

  async delete(id: CrudIdValue, ctx?: CrudContext): Promise<void> {
    const repo = this.getRepo();
    if (this.resolveDeleteMode(ctx) === 'soft') {
      assertSequelizeSoftDeleteSupported(repo);
    }
    const affected = await withSequelizeErrorMapping(() =>
      repo.destroy({
        where: {
          [this.getIdField(ctx)]: id,
        },
      })
    );
    if (!affected) {
      throw this.assertEntityFound(null);
    }
  }

  protected getRepo(): SequelizeLikeModel<T> {
    if (!this.repo) {
      throw new Error('SequelizeCrudService requires "repo" to be assigned');
    }
    return this.repo;
  }

  protected getIdField(ctx?: CrudContext): string {
    return this.resolveCrudOptions(ctx)?.id ?? 'id';
  }
}
