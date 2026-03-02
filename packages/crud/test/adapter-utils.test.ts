import {
  CrudFeatureNotSupportedError,
  CrudPersistenceError,
} from '../src';
import {
  assertMongooseSoftDeleteSupported,
  buildMongooseFilter,
  mapMongooseError,
  withMongooseErrorMapping,
} from '../src/mongoose/utils';
import {
  assertSequelizeSoftDeleteSupported,
  buildSequelizeFindOptions,
  buildSequelizeWhere,
  mapSequelizeError,
  withSequelizeErrorMapping,
} from '../src/sequelize/utils';

describe('sequelize and mongoose utils', () => {
  it('should build Sequelize where and find options for each query dimension', () => {
    const query = {
      page: 2,
      limit: 10,
      sort: [{ field: 'createdAt', order: 'DESC' as const }],
      filters: [
        { field: 'status', operator: 'eq' as const, value: 'active' },
        { field: 'id', operator: 'in' as const, value: '1,2' },
        { field: 'name', operator: 'like' as const, value: 'ha' },
      ],
      search: 'neo',
      joins: ['profile'],
      fields: ['id', 'name'],
    };
    const where = buildSequelizeWhere(query, {
      model: class TestModel {} as any,
      service: class TestService {} as any,
      query: {
        searchable: ['name', 'email'],
      },
    });
    const options = buildSequelizeFindOptions(query, {
      model: class TestModel {} as any,
      service: class TestService {} as any,
      query: {
        searchable: ['name', 'email'],
      },
    });

    expect(where.status).toBe('active');
    expect(where.id).toEqual({ in: ['1', '2'] });
    expect(where.name).toEqual({ like: '%ha%' });
    expect(where.or).toHaveLength(2);
    expect(options).toMatchObject({
      limit: 10,
      offset: 10,
      order: [['createdAt', 'DESC']],
      include: [{ association: 'profile' }],
      attributes: ['id', 'name'],
    });
  });

  it('should enforce Sequelize paranoid soft delete and map errors', async () => {
    expect(() =>
      assertSequelizeSoftDeleteSupported({
        options: {},
      } as any)
    ).toThrow(CrudFeatureNotSupportedError);
    expect(() =>
      assertSequelizeSoftDeleteSupported({
        options: {
          paranoid: true,
        },
      } as any)
    ).not.toThrow();

    expect(
      mapSequelizeError({
        name: 'SequelizeUniqueConstraintError',
      })
    ).toBeInstanceOf(CrudPersistenceError);
    expect(
      mapSequelizeError({
        name: 'SequelizeForeignKeyConstraintError',
      })
    ).toBeInstanceOf(CrudPersistenceError);
    const passthrough = new CrudPersistenceError('existing');
    expect(mapSequelizeError(null)).toBeNull();
    expect(mapSequelizeError(passthrough)).toBe(passthrough);
    const notFound = new Error('nf');
    Object.setPrototypeOf(notFound, Error.prototype);
    expect(mapSequelizeError(notFound)).toBe(notFound);

    await expect(
      withSequelizeErrorMapping(async () => {
        throw {
          name: 'SequelizeUniqueConstraintError',
        };
      })
    ).rejects.toThrow(CrudPersistenceError);
  });

  it('should build Mongoose filters, enforce deletedAt soft delete and map errors', async () => {
    const filter = buildMongooseFilter(
      {
        page: 1,
        limit: 20,
        sort: [],
        filters: [
          { field: 'status', operator: 'eq', value: 'active' },
          { field: 'age', operator: 'gt', value: 18 },
          { field: 'name', operator: 'like', value: 'har' },
        ],
        search: 'neo',
      },
      {
        model: class TestModel {} as any,
        service: class TestService {} as any,
        query: {
          searchable: ['name', 'email'],
        },
      }
    );

    expect(filter.status).toBe('active');
    expect(filter.age).toEqual({ $gt: 18 });
    expect(filter.name).toEqual({ $regex: 'har', $options: 'i' });
    expect(filter.$or).toHaveLength(2);

    const allOps = buildMongooseFilter(
      {
        page: 1,
        limit: 20,
        sort: [],
        filters: [
          { field: 'status', operator: 'ne', value: 'disabled' },
          { field: 'age', operator: 'gte', value: 18 },
          { field: 'rank', operator: 'lt', value: 10 },
          { field: 'score', operator: 'lte', value: 100 },
          { field: 'ids', operator: 'in', value: '1,2' },
        ],
      },
      {
        model: class TestModel {} as any,
        service: class TestService {} as any,
      }
    );
    expect(allOps.status).toEqual({ $ne: 'disabled' });
    expect(allOps.age).toEqual({ $gte: 18 });
    expect(allOps.rank).toEqual({ $lt: 10 });
    expect(allOps.score).toEqual({ $lte: 100 });
    expect(allOps.ids).toEqual({ $in: ['1', '2'] });

    expect(() =>
      assertMongooseSoftDeleteSupported({
        schema: {
          paths: {},
        },
      } as any)
    ).toThrow(CrudFeatureNotSupportedError);
    expect(() =>
      assertMongooseSoftDeleteSupported({
        schema: {
          paths: {
            deletedAt: {},
          },
        },
      } as any)
    ).not.toThrow();

    expect(mapMongooseError({ code: 11000 })).toBeInstanceOf(CrudPersistenceError);
    expect(mapMongooseError({ name: 'DocumentNotFoundError' })).toBeInstanceOf(Error);
    expect(mapMongooseError(null)).toBeNull();
    const existingFeatureError = new CrudFeatureNotSupportedError('x');
    expect(mapMongooseError(existingFeatureError)).toBe(existingFeatureError);
    await expect(
      withMongooseErrorMapping(async () => {
        throw { code: 11000 };
      })
    ).rejects.toThrow(CrudPersistenceError);
  });
});
