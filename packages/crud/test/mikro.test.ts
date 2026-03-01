import {
  CrudFeatureNotSupportedError,
  CrudPersistenceError,
} from '../src';
import { MikroCrudService } from '../src/mikro';

interface UserEntity {
  id: number;
  name: string;
  deletedAt?: Date | null;
}

function createService(
  overrides: Partial<MikroCrudService<UserEntity>['repo']> = {},
  options?: ConstructorParameters<typeof MikroCrudService<UserEntity>>[0]
) {
  const service = new MikroCrudService<UserEntity>({
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
      properties: {},
    },
    findAndCount: jest.fn().mockResolvedValue([[{ id: 1, name: 'harry' }], 1]),
    findOne: jest.fn().mockResolvedValue({ id: 1, name: 'harry' }),
    create: jest.fn(data => data),
    assign: jest.fn((target, source) => ({ ...target, ...source })),
    persistAndFlush: jest.fn().mockResolvedValue(undefined),
    nativeDelete: jest.fn().mockResolvedValue(1),
    ...overrides,
  } as any;

  return service;
}

describe('MikroCrudService', () => {
  it('should support list/detail/create/update/replace/delete', async () => {
    const service = createService();

    await expect(
      service.list({
        page: 1,
        limit: 20,
        sort: [{ field: 'id', order: 'DESC' }],
        filters: [{ field: 'name', operator: 'like', value: 'har' }],
        joins: ['profile'],
        fields: ['id'],
        search: 'har',
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
      name: 'neo',
    });
    await expect(service.replace(1, { name: 'trinity' })).resolves.toEqual({
      id: 1,
      name: 'trinity',
    });
    await service.delete(1);

    expect(service.repo.findAndCount).toHaveBeenCalled();
    expect(service.repo.nativeDelete).toHaveBeenCalledWith({ id: 1 });
  });

  it('should enforce deletedAt metadata for soft delete', async () => {
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

  it('should soft delete and map persistence errors', async () => {
    const service = createService(
      {
        metadata: {
          properties: {
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

    await service.delete(1);
    expect(service.repo.assign).toHaveBeenCalledWith(
      { id: 1, name: 'harry' },
      expect.objectContaining({
        deletedAt: expect.any(Date),
      })
    );

    const duplicate = createService({
      persistAndFlush: jest.fn().mockRejectedValue({ code: '23505' }),
    });
    await expect(duplicate.create({ name: 'taken' })).rejects.toThrow(
      CrudPersistenceError
    );
  });
});
