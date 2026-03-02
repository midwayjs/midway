import {
  CrudFeatureNotSupportedError,
  CrudNotFoundError,
  CrudPersistenceError,
} from '../src';
import { TypeOrmCrudService } from '../src/typeorm';

interface UserEntity {
  id: number;
  name: string;
  deletedAt?: Date | null;
}

function createQueryBuilderMock(data: UserEntity[] = [], total = data.length) {
  return {
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([data, total]),
  };
}

function createService(
  overrides: Partial<TypeOrmCrudService<UserEntity>['repo']> = {},
  options?: ConstructorParameters<typeof TypeOrmCrudService<UserEntity>>[0]
) {
  const service = new TypeOrmCrudService<UserEntity>({
    model: class UserModel {} as any,
    service: class UserService {} as any,
    query: {
      sortable: ['id', 'name'],
      filterable: ['id', 'name'],
      searchable: ['name'],
      join: ['profile'],
    },
    ...options,
  });

  service.repo = {
    metadata: {
      name: 'User',
      tableName: 'user',
      columns: [],
    },
    findOne: jest.fn(),
    create: jest.fn(data => data),
    save: jest.fn(async data => data),
    merge: jest.fn((target, source) => ({ ...target, ...source })),
    delete: jest.fn(async () => undefined),
    createQueryBuilder: jest.fn(() => createQueryBuilderMock()),
    ...overrides,
  } as any;

  return service;
}

describe('TypeOrmCrudService', () => {
  it('should list resources through the query builder', async () => {
    const qb = createQueryBuilderMock([{ id: 1, name: 'harry' }], 1);
    const service = createService({
      createQueryBuilder: jest.fn(() => qb),
    });

    const result = await service.list({
      page: 1,
      limit: 20,
      sort: [{ field: 'id', order: 'DESC' }],
      filters: [{ field: 'name', operator: 'like', value: 'har' }],
      joins: ['profile'],
      search: 'har',
    });

    expect(result.data).toEqual([{ id: 1, name: 'harry' }]);
    expect(result.meta.total).toBe(1);
    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('user.profile', 'profile');
    expect(qb.addOrderBy).toHaveBeenCalledWith('user.id', 'DESC');
    expect(qb.andWhere).toHaveBeenCalled();
  });

  it('should return resource detail for a single id', async () => {
    const service = createService({
      findOne: jest.fn().mockResolvedValue({ id: 1, name: 'harry' }),
    });

    await expect(service.findOne(1)).resolves.toEqual({ id: 1, name: 'harry' });
  });

  it('should create, update, replace and delete resources', async () => {
    const service = createService({
      findOne: jest
        .fn()
        .mockResolvedValueOnce({ id: 1, name: 'harry' })
        .mockResolvedValueOnce({ id: 1, name: 'harry' }),
    });

    await expect(service.create({ id: 1, name: 'harry' })).resolves.toEqual({
      id: 1,
      name: 'harry',
    });
    await expect(service.update(1, { name: 'neo' })).resolves.toEqual({
      id: 1,
      name: 'neo',
    });
    await expect(service.replace(1, { name: 'agent' })).resolves.toEqual({
      id: 1,
      name: 'agent',
    });

    await service.delete(1);

    expect(service.repo.create).toHaveBeenCalledWith({ id: 1, name: 'harry' });
    expect(service.repo.save).toHaveBeenCalledTimes(3);
    expect(service.repo.delete).toHaveBeenCalledWith({ id: 1 });
  });

  it('should reject soft delete when repository does not support it for delete/list/detail', async () => {
    const service = createService(
      {
        softDelete: jest.fn(),
      },
      {
        model: class UserModel {} as any,
        service: class UserService {} as any,
        delete: {
          mode: 'soft',
        },
      }
    );

    await expect(service.delete(1)).rejects.toThrow(CrudFeatureNotSupportedError);
    await expect(
      service.list({
        page: 1,
        limit: 20,
        sort: [],
        filters: [],
      })
    ).rejects.toThrow(CrudFeatureNotSupportedError);
    await expect(service.findOne(1)).rejects.toThrow(CrudFeatureNotSupportedError);
  });

  it('should use hard delete by default and soft delete when configured', async () => {
    const hardDeleteService = createService();
    await hardDeleteService.delete(1);
    expect(hardDeleteService.repo.delete).toHaveBeenCalledWith({ id: 1 });

    const softDeleteService = createService(
      {
        metadata: {
          name: 'User',
          tableName: 'user',
          columns: [{ isDeleteDate: true }],
        },
        softDelete: jest.fn(async () => undefined),
      },
      {
        model: class UserModel {} as any,
        service: class UserService {} as any,
        delete: {
          mode: 'soft',
        },
      }
    );

    await softDeleteService.delete(1);
    expect(softDeleteService.repo.softDelete).toHaveBeenCalledWith({ id: 1 });
  });

  it('should exclude soft-deleted rows in list and detail queries', async () => {
    const qb = createQueryBuilderMock([{ id: 1, name: 'harry' }], 1);
    const service = createService(
      {
        metadata: {
          name: 'User',
          tableName: 'user',
          columns: [{ isDeleteDate: true, propertyName: 'deletedAt' }],
        },
        createQueryBuilder: jest.fn(() => qb),
        findOne: jest.fn().mockResolvedValue({ id: 1, name: 'harry' }),
      },
      {
        model: class UserModel {} as any,
        service: class UserService {} as any,
        delete: {
          mode: 'soft',
        },
      }
    );

    await service.list({
      page: 1,
      limit: 20,
      sort: [],
      filters: [],
    });
    await service.findOne(1);

    expect(qb.andWhere).toHaveBeenCalledWith('user.deletedAt IS NULL');
    expect(service.repo.findOne).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        id: 1,
      },
    });
  });

  it('should map common database errors and 404 cases', async () => {
    const uniqueErrorService = createService({
      save: jest.fn().mockRejectedValue({ code: '23505' }),
    });
    await expect(uniqueErrorService.create({ name: 'taken' })).rejects.toThrow(
      CrudPersistenceError
    );

    const foreignKeyService = createService({
      delete: jest.fn().mockRejectedValue({ code: '23503' }),
    });
    await expect(foreignKeyService.delete(1)).rejects.toThrow(CrudPersistenceError);

    const notFoundService = createService({
      findOne: jest.fn().mockResolvedValue(null),
    });
    await expect(notFoundService.update(1, { name: 'none' })).rejects.toThrow(
      CrudNotFoundError
    );
  });

  it('should expose repo/id defaults and replace/getRepo fallback', async () => {
    const service = new TypeOrmCrudService<UserEntity>({
      model: class UserModel {} as any,
      service: class UserService {} as any,
    });
    await expect(service.findOne(1)).rejects.toThrow(
      'TypeOrmCrudService requires "repo" to be assigned'
    );

    const customId = createService(
      {
        findOne: jest
          .fn()
          .mockResolvedValueOnce({ userId: 1, name: 'harry' })
          .mockResolvedValueOnce({ userId: 1, name: 'harry' }),
      } as any,
      {
        model: class UserModel {} as any,
        service: class UserService {} as any,
        id: 'userId',
      }
    );
    await customId.replace(1, { name: 'neo' });
    expect(customId.repo.findOne).toHaveBeenCalledWith({
      where: {
        userId: 1,
      },
    });
  });
});
