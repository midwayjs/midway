import { BaseCrudService } from '../service';
import {
  CrudContext,
  CrudIdValue,
  CrudOptions,
  CrudPageResult,
  CrudQuery,
} from '../interface';
import {
  assertMongooseSoftDeleteSupported,
  buildMongooseFilter,
  MongooseLikeModel,
  withMongooseErrorMapping,
} from './utils';

/**
 * Default Mongoose CRUD adapter.
 */
export class MongooseCrudService<T> extends BaseCrudService<T> {
  repo: MongooseLikeModel<T>;

  constructor(options?: CrudOptions) {
    super();
    if (options) {
      this.setCrudOptions(options);
    }
  }

  async list(query: CrudQuery, ctx?: CrudContext): Promise<CrudPageResult<T>> {
    const repo = this.getRepo();
    const filter = this.getScopedFilter(query, ctx);
    const listQuery = repo.find(filter);

    if (query.sort.length) {
      listQuery.sort(
        query.sort.reduce(
          (acc, item) => {
            acc[item.field] = item.order === 'ASC' ? 1 : -1;
            return acc;
          },
          {} as Record<string, 1 | -1>
        )
      );
    }

    if (query.joins?.length) {
      query.joins.forEach(join => listQuery.populate(join));
    }

    if (query.fields?.length) {
      listQuery.select(query.fields.join(' '));
    }

    listQuery.skip((query.page - 1) * query.limit);
    listQuery.limit(query.limit);

    const [data, total] = await Promise.all([
      withMongooseErrorMapping(() => listQuery.exec()),
      withMongooseErrorMapping(() => repo.countDocuments(filter)),
    ]);

    return this.normalizePageResult(data, query.page, query.limit, total);
  }

  async findOne(id: CrudIdValue, ctx?: CrudContext): Promise<T | null> {
    const filter = this.getIdFilter(id, ctx);
    return withMongooseErrorMapping(() => this.getRepo().findOne(filter));
  }

  async create(data: unknown, _ctx?: CrudContext): Promise<T> {
    void _ctx;
    return withMongooseErrorMapping(() => this.getRepo().create(data as any));
  }

  async update(id: CrudIdValue, data: unknown, ctx?: CrudContext): Promise<T> {
    const result = await withMongooseErrorMapping(() =>
      this.getRepo().findOneAndUpdate(this.getIdFilter(id, ctx), data as any, {
        new: true,
      })
    );
    return this.assertEntityFound(result);
  }

  async replace(id: CrudIdValue, data: unknown, ctx?: CrudContext): Promise<T> {
    return this.update(id, data, ctx);
  }

  async delete(id: CrudIdValue, ctx?: CrudContext): Promise<void> {
    const repo = this.getRepo();
    if (this.resolveDeleteMode(ctx) === 'soft') {
      assertMongooseSoftDeleteSupported(repo);
      const updated = await withMongooseErrorMapping(() =>
        repo.findOneAndUpdate(
          this.getIdFilter(id, ctx),
          { deletedAt: new Date() },
          { new: false }
        )
      );
      this.assertEntityFound(updated);
      return;
    }
    const result = await withMongooseErrorMapping(() =>
      repo.deleteOne(this.getIdFilter(id, ctx))
    );
    if (!result?.deletedCount) {
      throw this.assertEntityFound(null);
    }
  }

  protected getRepo(): MongooseLikeModel<T> {
    if (!this.repo) {
      throw new Error('MongooseCrudService requires "repo" to be assigned');
    }
    return this.repo;
  }

  protected getScopedFilter(
    query: CrudQuery,
    ctx?: CrudContext
  ): Record<string, any> {
    const filter = buildMongooseFilter(query, this.resolveCrudOptions(ctx));
    if (this.resolveDeleteMode(ctx) === 'soft') {
      assertMongooseSoftDeleteSupported(this.getRepo());
      filter.deletedAt = null;
    }
    return filter;
  }

  protected getIdFilter(
    id: CrudIdValue,
    ctx?: CrudContext
  ): Record<string, any> {
    const filter: Record<string, any> = {
      [this.getIdField(ctx)]: id,
    };
    if (this.resolveDeleteMode(ctx) === 'soft') {
      assertMongooseSoftDeleteSupported(this.getRepo());
      filter.deletedAt = null;
    }
    return filter;
  }

  protected getIdField(ctx?: CrudContext): string {
    return this.resolveCrudOptions(ctx)?.id ?? '_id';
  }
}
