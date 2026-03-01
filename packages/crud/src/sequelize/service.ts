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

  async list(query: CrudQuery, _ctx?: CrudContext): Promise<CrudPageResult<T>> {
    void _ctx;
    const repo = this.getRepo();
    if (this.resolveDeleteMode() === 'soft') {
      assertSequelizeSoftDeleteSupported(repo);
    }
    const result = await withSequelizeErrorMapping(() =>
      repo.findAndCountAll(buildSequelizeFindOptions(query, this.crudOptions))
    );
    return this.normalizePageResult(
      result.rows,
      query.page,
      query.limit,
      result.count
    );
  }

  async findOne(id: CrudIdValue, _ctx?: CrudContext): Promise<T | null> {
    void _ctx;
    const repo = this.getRepo();
    if (this.resolveDeleteMode() === 'soft') {
      assertSequelizeSoftDeleteSupported(repo);
    }
    return withSequelizeErrorMapping(() => repo.findByPk(id));
  }

  async create(data: unknown, _ctx?: CrudContext): Promise<T> {
    void _ctx;
    return withSequelizeErrorMapping(() => this.getRepo().create(data as any));
  }

  async update(id: CrudIdValue, data: unknown, _ctx?: CrudContext): Promise<T> {
    void _ctx;
    const repo = this.getRepo();
    const [count] = await withSequelizeErrorMapping(() =>
      repo.update(data as any, {
        where: {
          [this.getIdField()]: id,
        },
      })
    );
    if (!count) {
      throw this.assertEntityFound(null);
    }
    return this.assertEntityFound(await this.findOne(id));
  }

  async replace(id: CrudIdValue, data: unknown, ctx?: CrudContext): Promise<T> {
    return this.update(id, data, ctx);
  }

  async delete(id: CrudIdValue, _ctx?: CrudContext): Promise<void> {
    void _ctx;
    const repo = this.getRepo();
    if (this.resolveDeleteMode() === 'soft') {
      assertSequelizeSoftDeleteSupported(repo);
    }
    const affected = await withSequelizeErrorMapping(() =>
      repo.destroy({
        where: {
          [this.getIdField()]: id,
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

  protected getIdField(): string {
    return this.crudOptions?.id ?? 'id';
  }
}
