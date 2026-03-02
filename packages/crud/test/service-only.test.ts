import { TypeOrmCrudService } from '../src/typeorm';

interface UserEntity {
  id: number;
  name: string;
}

class UserCrudService extends TypeOrmCrudService<UserEntity> {}

class UserDomainService {
  constructor(readonly users: UserCrudService) {}

  async createUser(input: UserEntity) {
    return this.users.create(input);
  }

  async listUsers() {
    return this.users.list({
      page: 1,
      limit: 20,
      sort: [],
      filters: [],
    });
  }
}

describe('service-only composition', () => {
  it('should allow business services to compose CrudService without @Crud()', async () => {
    const crudService = new UserCrudService({
      model: class UserModel {} as any,
      service: class UserService {} as any,
    });

    crudService.repo = {
      metadata: {
        name: 'User',
        tableName: 'user',
        columns: [],
      },
      createQueryBuilder: jest.fn(() => ({
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[{ id: 1, name: 'harry' }], 1]),
      })),
      findOne: jest.fn(),
      create: jest.fn(data => data),
      save: jest.fn(async data => data),
      merge: jest.fn((target, source) => ({ ...target, ...source })),
      delete: jest.fn(async () => undefined),
    } as any;

    const domainService = new UserDomainService(crudService);

    await expect(domainService.createUser({ id: 1, name: 'harry' })).resolves.toEqual({
      id: 1,
      name: 'harry',
    });
    await expect(domainService.listUsers()).resolves.toMatchObject({
      data: [{ id: 1, name: 'harry' }],
      meta: {
        total: 1,
      },
    });
  });
});
