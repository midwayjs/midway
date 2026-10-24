import {
  Controller,
  Inject,
  MetadataManager,
  MidwayContainer,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import {
  Column,
  DataSource,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Repository,
} from 'typeorm';
import { RULES_KEY } from '../../validation/src/constants';
import { Rule } from '../../validation/src/decorator/rule';
import {
  Crud,
  CrudNotFoundError,
  CrudRouteName,
  getCrudOptions,
  getEnabledCrudRoutes,
} from '../src';
import { createCrudControllerMethod } from '../src/routeBuilder';
import { TypeOrmCrudService } from '../src/typeorm';

// Joi is a devDependency of @midwayjs/validation-joi, not of this package.
import Joi = require('../../validation-joi/node_modules/joi');

@Entity('crud_integration_user')
class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column({ type: 'integer' })
  visits: number;

  @DeleteDateColumn()
  deletedAt?: Date;
}

class CreateUserDTO {
  @Rule(Joi.string().required())
  name: string;

  @Rule(Joi.string().default('guest'))
  role: string;

  @Rule(Joi.number().integer().default(0))
  visits: number;
}

class UpdateUserDTO {
  @Rule(Joi.string())
  name: string;

  @Rule(Joi.string().default('guest'))
  role: string;

  @Rule(Joi.number().integer().default(0))
  visits: number;
}

const queryOptions = {
  searchable: ['name'],
  sortable: ['id', 'name'],
  filterable: ['name'],
};

@Provide()
@Scope(ScopeEnum.Singleton)
class UserCrudService extends TypeOrmCrudService<UserEntity> {}

@Controller('/soft-users')
@Crud({
  model: UserEntity,
  service: UserCrudService,
  delete: {
    mode: 'soft',
  },
  dto: {
    create: CreateUserDTO,
    update: UpdateUserDTO,
  },
  query: queryOptions,
})
class SoftUserController {
  @Inject()
  crudService: UserCrudService;
}

@Controller('/hard-users')
@Crud({
  model: UserEntity,
  service: UserCrudService,
  delete: {
    mode: 'hard',
  },
  query: {
    searchable: ['role'],
    sortable: ['id'],
    filterable: ['role'],
  },
})
class HardUserController {
  @Inject()
  crudService: UserCrudService;
}

@Controller('/inherited-users')
@Crud({
  model: UserEntity,
  service: UserCrudService,
})
class InheritedUserController {
  @Inject()
  crudService: UserCrudService;
}

const validationService = {
  validate(dto: new (...args: any[]) => any, value: unknown) {
    const rules = MetadataManager.getPropertiesWithMetadata(RULES_KEY, dto);
    const result = Joi.object(rules).validate(value);
    if (result.error) {
      throw result.error;
    }
    return {
      status: true,
      value: result.value,
    };
  },
};

function installGeneratedRoutes(target: new (...args: any[]) => any) {
  const options = getCrudOptions(target)!;
  for (const route of getEnabledCrudRoutes(options)) {
    Object.defineProperty(target.prototype, route, {
      value: createCrudControllerMethod(route as CrudRouteName, options),
      writable: true,
      configurable: true,
    });
  }
}

function requestOf(input: {
  params?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
}) {
  return {
    ...input,
    requestContext: {
      async getAsync(id: string) {
        await new Promise(resolve => setTimeout(resolve, 25));
        if (id !== 'validationService') {
          throw new Error(`unexpected service ${id}`);
        }
        return validationService;
      },
    },
  };
}

type GeneratedCrudController = {
  list(input: any): Promise<{ data: UserEntity[] }>;
  detail(input: any): Promise<UserEntity>;
  create(input: any): Promise<UserEntity>;
  update(input: any): Promise<UserEntity>;
  delete(input: any): Promise<void>;
};

describe('TypeORM CRUD integration', () => {
  let dataSource: DataSource;
  let repo: Repository<UserEntity>;
  let service: UserCrudService;
  let softController: SoftUserController & GeneratedCrudController;
  let hardController: HardUserController & GeneratedCrudController;
  let inheritedController: InheritedUserController & GeneratedCrudController;

  const baseServiceOptions = {
    model: UserEntity,
    service: UserCrudService,
    query: queryOptions,
  };

  beforeAll(async () => {
    installGeneratedRoutes(SoftUserController);
    installGeneratedRoutes(HardUserController);
    installGeneratedRoutes(InheritedUserController);

    dataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [UserEntity],
      synchronize: true,
      logging: false,
    });
    await dataSource.initialize();
    repo = dataSource.getRepository(UserEntity);

    const container = new MidwayContainer();
    container.bindClass(UserCrudService);
    container.bindClass(SoftUserController);
    container.bindClass(HardUserController);
    container.bindClass(InheritedUserController);

    service = await container.getAsync(UserCrudService);
    const again = await container.getAsync(UserCrudService);
    expect(again).toBe(service);
    service.repo = repo;
    service.setCrudOptions(baseServiceOptions);

    softController = (await container.getAsync(
      SoftUserController
    )) as SoftUserController & GeneratedCrudController;
    hardController = (await container.getAsync(
      HardUserController
    )) as HardUserController & GeneratedCrudController;
    inheritedController = (await container.getAsync(
      InheritedUserController
    )) as InheritedUserController & GeneratedCrudController;
    expect(softController.crudService).toBe(service);
    expect(hardController.crudService).toBe(service);
    expect(inheritedController.crudService).toBe(service);
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    service.setCrudOptions(baseServiceOptions);
    await repo.createQueryBuilder().delete().from(UserEntity).execute();
  });

  it('should honor each @Crud delete mode and query allow-list on one singleton', async () => {
    const softTarget = await repo.save(
      repo.create({ name: 'soft-target', role: 'admin', visits: 1 })
    );
    const hardTarget = await repo.save(
      repo.create({ name: 'hard-target', role: 'admin', visits: 1 })
    );
    await repo.save(repo.create({ name: 'neo', role: 'admin', visits: 2 }));
    await repo.save(repo.create({ name: 'trinity', role: 'guest', visits: 3 }));

    const [softList, hardList] = await Promise.all([
      softController.list(
        requestOf({
          query: { search: 'neo' },
        })
      ),
      hardController.list(
        requestOf({
          query: { search: 'guest' },
        })
      ),
      softController.delete(
        requestOf({
          params: { id: String(softTarget.id) },
        })
      ),
      hardController.delete(
        requestOf({
          params: { id: String(hardTarget.id) },
        })
      ),
    ]);

    expect(softList.data.map(item => item.name)).toEqual(['neo']);
    expect(hardList.data.map(item => item.name)).toEqual(['trinity']);
    expect(service.getCrudOptions()).toEqual(baseServiceOptions);

    const softRow = await repo.findOne({
      where: { id: softTarget.id },
      withDeleted: true,
    });
    expect(softRow?.deletedAt).toBeInstanceOf(Date);
    expect(
      await repo.findOne({
        where: { id: hardTarget.id },
        withDeleted: true,
      })
    ).toBeNull();

    const alive = await repo.findOneByOrFail({ name: 'neo' });
    await expect(
      softController.detail(
        requestOf({
          params: { id: String(alive.id) },
        })
      )
    ).resolves.toMatchObject({ name: 'neo', role: 'admin' });
    await expect(
      softController.detail(
        requestOf({
          params: { id: String(softTarget.id) },
        })
      )
    ).rejects.toBeInstanceOf(CrudNotFoundError);

    const listed = await softController.list(requestOf({ query: {} }));
    expect(listed.data.map(item => item.id)).not.toContain(softTarget.id);
  });

  it('should keep service soft-delete when a controller omits delete', async () => {
    service.setCrudOptions({
      ...baseServiceOptions,
      delete: {
        mode: 'soft',
      },
    });
    const inheritedTarget = await repo.save(
      repo.create({ name: 'inherited', role: 'admin', visits: 1 })
    );
    const hardTarget = await repo.save(
      repo.create({ name: 'purged', role: 'admin', visits: 1 })
    );

    await inheritedController.delete(
      requestOf({
        params: { id: String(inheritedTarget.id) },
      })
    );
    await hardController.delete(
      requestOf({
        params: { id: String(hardTarget.id) },
      })
    );

    expect(
      (
        await repo.findOne({
          where: { id: inheritedTarget.id },
          withDeleted: true,
        })
      )?.deletedAt
    ).toBeInstanceOf(Date);
    expect(
      await repo.findOne({
        where: { id: hardTarget.id },
        withDeleted: true,
      })
    ).toBeNull();
    expect(service.getCrudOptions()?.delete?.mode).toBe('soft');

    const stillSoft = await repo.save(
      repo.create({ name: 'still-soft', role: 'admin', visits: 1 })
    );
    await inheritedController.delete(
      requestOf({
        params: { id: String(stillSoft.id) },
      })
    );
    expect(
      (
        await repo.findOne({
          where: { id: stillSoft.id },
          withDeleted: true,
        })
      )?.deletedAt
    ).toBeInstanceOf(Date);
  });

  it('should apply create defaults and keep absent patch fields', async () => {
    const created = await softController.create(
      requestOf({
        body: { name: 'neo' },
      })
    );
    expect(created).toMatchObject({
      name: 'neo',
      role: 'guest',
      visits: 0,
    });

    await repo.update(created.id, { role: 'admin', visits: 7 });
    const updated = await softController.update(
      requestOf({
        params: { id: String(created.id) },
        body: { name: 'trinity', visits: '9' },
      })
    );

    expect(updated).toMatchObject({
      name: 'trinity',
      role: 'admin',
      visits: 9,
    });
    await expect(repo.findOneByOrFail({ id: created.id })).resolves.toMatchObject(
      {
        name: 'trinity',
        role: 'admin',
        visits: 9,
      }
    );
  });
});
