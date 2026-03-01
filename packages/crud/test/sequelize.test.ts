import { CrudFeatureNotSupportedError, CrudPersistenceError } from '../src';
import { SequelizeCrudService } from '../src/sequelize';

interface UserEntity {
  id: number;
  name: string;
}

function createService(
  overrides: Partial<SequelizeCrudService<UserEntity>['repo']> = {},
  options?: ConstructorParameters<typeof SequelizeCrudService<UserEntity>>[0]
) {
  const service = new SequelizeCrudService<UserEntity>({
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
    options: {},
    findAndCountAll: jest.fn().mockResolvedValue({
      rows: [{ id: 1, name: 'harry' }],
      count: 1,
    }),
    findByPk: jest.fn().mockResolvedValue({ id: 1, name: 'harry' }),
    create: jest.fn(async data => data),
    update: jest.fn().mockResolvedValue([1]),
    destroy: jest.fn().mockResolvedValue(1),
    ...overrides,
  } as any;

  return service;
}

describe('SequelizeCrudService', () => {
  it('should support list/detail/create/update/delete', async () => {
    const service = createService();

    await expect(
      service.list({
        page: 1,
        limit: 20,
        sort: [{ field: 'id', order: 'DESC' }],
        filters: [{ field: 'name', operator: 'like', value: 'har' }],
        search: 'har',
        joins: ['profile'],
      })
    ).resolves.toMatchObject({
      data: [{ id: 1, name: 'harry' }],
      meta: { total: 1 },
    });
    await expect(service.findOne(1)).resolves.toEqual({ id: 1, name: 'harry' });
    await expect(service.create({ id: 2, name: 'neo' })).resolves.toEqual({
      id: 2,
      name: 'neo',
    });
    await expect(service.update(1, { name: 'neo' })).resolves.toEqual({
      id: 1,
      name: 'harry',
    });
    await service.delete(1);

    expect(service.repo.findAndCountAll).toHaveBeenCalled();
    expect(service.repo.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should require paranoid mode for soft delete', async () => {
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
    await expect(service.findOne(1)).rejects.toThrow(CrudFeatureNotSupportedError);
    await expect(service.delete(1)).rejects.toThrow(CrudFeatureNotSupportedError);
  });

  it('should map Sequelize persistence errors', async () => {
    const service = createService({
      create: jest.fn().mockRejectedValue({
        name: 'SequelizeUniqueConstraintError',
      }),
    });

    await expect(service.create({ name: 'taken' })).rejects.toThrow(
      CrudPersistenceError
    );
  });

  it('should expose repo/id defaults and not-found branches', async () => {
    const service = new SequelizeCrudService<UserEntity>({
      model: class UserModel {} as any,
      service: class UserService {} as any,
    });
    await expect(service.findOne(1)).rejects.toThrow(
      'SequelizeCrudService requires "repo" to be assigned'
    );

    const noCount = createService({
      update: jest.fn().mockResolvedValue([0]),
    });
    await expect(noCount.update(1, { name: 'none' })).rejects.toThrow('Resource not found');

    const noDelete = createService({
      destroy: jest.fn().mockResolvedValue(0),
    });
    await expect(noDelete.delete(1)).rejects.toThrow('Resource not found');

    const customId = createService(
      {
        findByPk: jest.fn().mockResolvedValue({ userId: 1, name: 'harry' }),
      },
      {
        model: class UserModel {} as any,
        service: class UserService {} as any,
        id: 'userId',
      }
    );
    await customId.update(1, { name: 'neo' });
    expect(customId.repo.update).toHaveBeenCalledWith(
      { name: 'neo' },
      {
        where: {
          userId: 1,
        },
      }
    );
  });
});
