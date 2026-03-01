import { CrudFeatureNotSupportedError, CrudPersistenceError } from '../src';
import { MongooseCrudService } from '../src/mongoose';

interface UserEntity {
  _id: string;
  name: string;
  deletedAt?: Date | null;
}

function createQuery<T>(value: T) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  };
}

function createService(
  overrides: Partial<MongooseCrudService<UserEntity>['repo']> = {},
  options?: ConstructorParameters<typeof MongooseCrudService<UserEntity>>[0]
) {
  const service = new MongooseCrudService<UserEntity>({
    model: class UserModel {} as any,
    service: class UserService {} as any,
    query: {
      sortable: ['_id', 'name'],
      filterable: ['_id', 'name'],
      searchable: ['name'],
      join: ['profile'],
    },
    ...options,
  });

  service.repo = {
    schema: {
      paths: {},
    },
    find: jest.fn().mockReturnValue(createQuery([{ _id: '1', name: 'harry' }])),
    findOne: jest.fn().mockResolvedValue({ _id: '1', name: 'harry' }),
    countDocuments: jest.fn().mockResolvedValue(1),
    create: jest.fn(async data => data),
    findOneAndUpdate: jest.fn().mockResolvedValue({ _id: '1', name: 'neo' }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    ...overrides,
  } as any;

  return service;
}

describe('MongooseCrudService', () => {
  it('should support list/detail/create/update/delete', async () => {
    const service = createService();

    await expect(
      service.list({
        page: 1,
        limit: 20,
        sort: [{ field: 'name', order: 'DESC' }],
        filters: [{ field: 'name', operator: 'like', value: 'har' }],
        joins: ['profile'],
        fields: ['name'],
      })
    ).resolves.toMatchObject({
      data: [{ _id: '1', name: 'harry' }],
      meta: { total: 1 },
    });
    await expect(service.findOne('1')).resolves.toEqual({ _id: '1', name: 'harry' });
    await expect(service.create({ _id: '2', name: 'neo' })).resolves.toEqual({
      _id: '2',
      name: 'neo',
    });
    await expect(service.update('1', { name: 'neo' })).resolves.toEqual({
      _id: '1',
      name: 'neo',
    });
    await service.delete('1');

    expect(service.repo.countDocuments).toHaveBeenCalled();
    expect(service.repo.deleteOne).toHaveBeenCalledWith({ _id: '1' });
  });

  it('should enforce deletedAt support for soft delete', async () => {
    const service = createService(
      {},
      {
        model: class UserModel {} as any,
        service: class UserService {} as any,
        delete: {
          mode: 'soft',
        },
      }
    );

    await expect(
      service.list({
        page: 1,
        limit: 20,
        sort: [],
        filters: [],
      })
    ).rejects.toThrow(CrudFeatureNotSupportedError);
  });

  it('should use deletedAt conventions for soft delete and map duplicate key errors', async () => {
    const service = createService(
      {
        schema: {
          paths: {
            deletedAt: {},
          },
        },
      },
      {
        model: class UserModel {} as any,
        service: class UserService {} as any,
        delete: {
          mode: 'soft',
        },
      }
    );

    await service.findOne('1');
    await service.delete('1');
    expect(service.repo.findOne).toHaveBeenCalledWith({
      _id: '1',
      deletedAt: null,
    });
    expect(service.repo.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: '1',
        deletedAt: null,
      },
      expect.objectContaining({
        deletedAt: expect.any(Date),
      }),
      { new: false }
    );

    const duplicateService = createService({
      create: jest.fn().mockRejectedValue({ code: 11000 }),
    });
    await expect(duplicateService.create({ name: 'taken' })).rejects.toThrow(
      CrudPersistenceError
    );
  });

  it('should expose repo/id defaults and not-found branches', async () => {
    const service = new MongooseCrudService<UserEntity>({
      model: class UserModel {} as any,
      service: class UserService {} as any,
    });

    await expect(
      service.delete('1')
    ).rejects.toThrow('MongooseCrudService requires "repo" to be assigned');

    const notFoundUpdate = createService({
      findOneAndUpdate: jest.fn().mockResolvedValue(null),
    });
    await expect(notFoundUpdate.update('1', { name: 'none' })).rejects.toThrow(
      'Resource not found'
    );

    const notFoundDelete = createService({
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 0 }),
    });
    await expect(notFoundDelete.delete('1')).rejects.toThrow('Resource not found');

    const customId = createService(
      {
        findOne: jest.fn().mockResolvedValue({ id: '1', name: 'harry' }),
      },
      {
        model: class UserModel {} as any,
        service: class UserService {} as any,
        id: 'id',
      }
    );
    await customId.findOne('1');
    expect(customId.repo.findOne).toHaveBeenCalledWith({ id: '1' });
  });
});
