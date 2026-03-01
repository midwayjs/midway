import {
  CrudFeatureNotSupportedError,
  CrudNotFoundError,
  CrudPersistenceError,
} from '../src';
import {
  assertSoftDeleteSupported,
  buildTypeOrmQueryBuilder,
  getSoftDeleteColumnName,
  mapCrudFilterToTypeOrmOperator,
  mapTypeOrmError,
  withTypeOrmErrorMapping,
} from '../src/typeorm/utils';

describe('typeorm utils', () => {
  it('should map every supported CRUD filter operator', () => {
    expect(mapCrudFilterToTypeOrmOperator({ field: 'a', operator: 'eq', value: 1 })).toEqual({
      type: 'Equal',
      value: 1,
    });
    expect(mapCrudFilterToTypeOrmOperator({ field: 'a', operator: 'ne', value: 1 })).toEqual({
      type: 'Not',
      value: 1,
    });
    expect(mapCrudFilterToTypeOrmOperator({ field: 'a', operator: 'gt', value: 1 })).toEqual({
      type: 'MoreThan',
      value: 1,
    });
    expect(mapCrudFilterToTypeOrmOperator({ field: 'a', operator: 'gte', value: 1 })).toEqual({
      type: 'MoreThanOrEqual',
      value: 1,
    });
    expect(mapCrudFilterToTypeOrmOperator({ field: 'a', operator: 'lt', value: 1 })).toEqual({
      type: 'LessThan',
      value: 1,
    });
    expect(mapCrudFilterToTypeOrmOperator({ field: 'a', operator: 'lte', value: 1 })).toEqual({
      type: 'LessThanOrEqual',
      value: 1,
    });
    expect(mapCrudFilterToTypeOrmOperator({ field: 'a', operator: 'in', value: '1,2' })).toEqual({
      type: 'In',
      value: ['1', '2'],
    });
    expect(mapCrudFilterToTypeOrmOperator({ field: 'a', operator: 'like', value: 'neo' })).toEqual({
      type: 'Like',
      value: '%neo%',
    });
    expect(
      mapCrudFilterToTypeOrmOperator({ field: 'a', operator: 'raw' as any, value: 'x' })
    ).toEqual({
      type: 'Raw',
      value: 'x',
    });
  });

  it('should assert and resolve soft delete column information', () => {
    const repo = {
      metadata: {
        columns: [{ isDeleteDate: true, propertyName: 'deletedAt' }],
      },
    } as any;
    expect(() => assertSoftDeleteSupported(repo)).not.toThrow();
    expect(getSoftDeleteColumnName(repo)).toBe('deletedAt');
    expect(
      getSoftDeleteColumnName({
        metadata: {
          columns: [{ isDeleteDate: true }],
        },
      } as any)
    ).toBe('deletedAt');

    const invalidRepo = {
      metadata: {
        columns: [],
      },
    } as any;
    expect(() => assertSoftDeleteSupported(invalidRepo)).toThrow(
      CrudFeatureNotSupportedError
    );
  });

  it('should map known database errors and preserve unknown ones', async () => {
    expect(mapTypeOrmError({ code: '23505' })).toBeInstanceOf(CrudPersistenceError);
    expect(mapTypeOrmError({ code: '23503' })).toBeInstanceOf(CrudPersistenceError);
    expect(mapTypeOrmError({ name: 'EntityNotFoundError' })).toBeInstanceOf(
      CrudNotFoundError
    );
    expect(mapTypeOrmError(null)).toBeNull();
    const existing = new CrudPersistenceError('exists');
    expect(mapTypeOrmError(existing)).toBe(existing);

    const customError = new Error('custom');
    expect(mapTypeOrmError(customError)).toBe(customError);

    await expect(
      withTypeOrmErrorMapping(async () => {
        throw { code: '1062' };
      })
    ).rejects.toThrow(CrudPersistenceError);
  });

  it('should build query builder state for paging, sorting, filtering, search, joins and soft delete', () => {
    const qb = {
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };
    const repo = {
      metadata: {
        tableName: 'user',
        columns: [{ isDeleteDate: true, propertyName: 'deletedAt' }],
      },
      createQueryBuilder: jest.fn().mockReturnValue(qb),
    } as any;

    const built = buildTypeOrmQueryBuilder(
      repo,
      {
        page: 2,
        limit: 10,
        sort: [{ field: 'createdAt', order: 'DESC' }],
        filters: [
          { field: 'status', operator: 'eq', value: 'active' },
          { field: 'id', operator: 'in', value: '1,2' },
        ],
        search: 'harry',
        joins: ['profile'],
      },
      {
        model: class TestModel {} as any,
        service: class TestService {} as any,
        delete: {
          mode: 'soft',
        },
        query: {
          searchable: ['name', 'email'],
        },
      }
    );

    expect(built).toBe(qb);
    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('user.profile', 'profile');
    expect(qb.addOrderBy).toHaveBeenCalledWith('user.createdAt', 'DESC');
    expect(qb.skip).toHaveBeenCalledWith(10);
    expect(qb.take).toHaveBeenCalledWith(10);
    expect(qb.andWhere).toHaveBeenCalledWith('user.deletedAt IS NULL');
  });

  it('should cover all query builder filter branches and alias fallbacks', () => {
    const qb = {
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    buildTypeOrmQueryBuilder(
      {
        metadata: {
          name: 'User',
          columns: [],
        },
        createQueryBuilder: jest.fn().mockReturnValue(qb),
      } as any,
      {
        page: 1,
        limit: 20,
        sort: [],
        filters: [
          { field: 'a', operator: 'ne', value: 1 },
          { field: 'b', operator: 'gt', value: 2 },
          { field: 'c', operator: 'gte', value: 3 },
          { field: 'd', operator: 'lt', value: 4 },
          { field: 'e', operator: 'lte', value: 5 },
          { field: 'f', operator: 'like', value: 'neo' },
        ],
      } as any
    );
    expect(qb.andWhere).toHaveBeenCalledWith('user.a != :crud_filter_0', {
      crud_filter_0: 1,
    });
    expect(qb.andWhere).toHaveBeenCalledWith('user.b > :crud_filter_1', {
      crud_filter_1: 2,
    });
    expect(qb.andWhere).toHaveBeenCalledWith('user.c >= :crud_filter_2', {
      crud_filter_2: 3,
    });
    expect(qb.andWhere).toHaveBeenCalledWith('user.d < :crud_filter_3', {
      crud_filter_3: 4,
    });
    expect(qb.andWhere).toHaveBeenCalledWith('user.e <= :crud_filter_4', {
      crud_filter_4: 5,
    });
    expect(qb.andWhere).toHaveBeenCalledWith('user.f LIKE :crud_filter_5', {
      crud_filter_5: '%neo%',
    });

    const entityQb = {
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };
    buildTypeOrmQueryBuilder(
      {
        metadata: {
          columns: [],
        },
        createQueryBuilder: jest.fn().mockReturnValue(entityQb),
      } as any,
      {
        page: 1,
        limit: 10,
        sort: [],
        filters: [],
      } as any
    );
    expect(entityQb.skip).toHaveBeenCalledWith(0);

    expect(() =>
      buildTypeOrmQueryBuilder(
        {
          metadata: {
            columns: [],
          },
        } as any,
        {
          page: 1,
          limit: 10,
          sort: [],
          filters: [],
        } as any
      )
    ).toThrow(CrudFeatureNotSupportedError);
  });
});
