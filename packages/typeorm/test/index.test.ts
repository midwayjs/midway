import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { close, createLegacyLightApp } from '@midwayjs/mock';
import { IMidwayApplication } from '@midwayjs/core';
import {
  Column,
  DataSource,
  Entity,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TypeORMDataSourceManager } from '../src/dataSourceManager';

@Entity()
class SubscriberUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}

@EventSubscriber()
class ContainerSubscriber implements EntitySubscriberInterface<SubscriberUser> {
  called = false;

  listenTo() {
    return SubscriberUser;
  }

  afterInsert(event: InsertEvent<SubscriberUser>) {
    this.called = event.entity.name === 'container';
  }
}

@EventSubscriber()
class FallbackSubscriber implements EntitySubscriberInterface<SubscriberUser> {
  called = false;

  listenTo() {
    return SubscriberUser;
  }

  afterInsert(event: InsertEvent<SubscriberUser>) {
    this.called = event.entity.name === 'fallback';
  }
}

describe('/test/index.test.ts', () => {
  it('should test base entity', async () => {
    cleanFile(join(__dirname, 'fixtures/base-fn-origin', 'test.sqlite'));

    const app: IMidwayApplication = await createLegacyLightApp(join(__dirname, 'fixtures/base-fn-origin'), {});
    const result = app.getAttr<string>('result');

    expect(result.includes('hello world')).toBeTruthy();
    expect(result).toEqual('hello world[[{"id":1,"name":"oneuser1"}],1]');

    await close(app);
  });

  it('should create subscriber class from midway container', async () => {
    const manager = createDataSourceManager();
    const subscriber = new ContainerSubscriber();
    const getAsync = jest.fn().mockResolvedValue(subscriber);
    (manager as any).applicationContext = { getAsync };

    const dataSource = await createSubscriberDataSource(manager, {
      subscribers: [ContainerSubscriber],
    });

    try {
      expect(getAsync).toHaveBeenCalledWith(ContainerSubscriber);
      expect(dataSource.subscribers).toContain(subscriber);

      await dataSource.getRepository(SubscriberUser).save({ name: 'container' });
      expect(subscriber.called).toBeTruthy();
    } finally {
      await dataSource.destroy();
    }
  });

  it('should create subscriber class with fallback new', async () => {
    const manager = createDataSourceManager();
    (manager as any).applicationContext = {
      getAsync: jest.fn().mockRejectedValue(new Error('not found')),
    };

    const dataSource = await createSubscriberDataSource(manager, {
      subscribers: [FallbackSubscriber],
    });

    try {
      const subscriber = dataSource.subscribers.find(
        subscriber => subscriber instanceof FallbackSubscriber
      ) as FallbackSubscriber;

      expect(subscriber).toBeDefined();
      await dataSource.getRepository(SubscriberUser).save({ name: 'fallback' });
      expect(subscriber.called).toBeTruthy();
    } finally {
      await dataSource.destroy();
    }
  });

  it('should split midway subscriber classes from typeorm managed subscribers', () => {
    const manager = createDataSourceManager();
    const subscribers = {
      container: ContainerSubscriber,
      glob: join(__dirname, 'fixtures/base-fn-origin/src/**/*.subscriber.ts'),
    };

    expect((manager as any).filterSubscriberClasses(subscribers)).toEqual([
      ContainerSubscriber,
    ]);
    expect((manager as any).filterTypeORMManagedSubscribers(subscribers)).toEqual([
      subscribers.glob,
    ]);
    expect((manager as any).filterSubscriberClasses(undefined)).toEqual([]);
  });
});

function cleanFile(file) {
  if (existsSync(file)) {
    unlinkSync(file);
  }
}

function createDataSourceManager() {
  const manager = new TypeORMDataSourceManager();
  (manager as any).typeormConfig = {
    allowExecuteMigrations: false,
  };
  return manager;
}

async function createSubscriberDataSource(
  manager: TypeORMDataSourceManager,
  options: {
    subscribers: any[];
  }
) {
  return (manager as any).createDataSource(
    {
      type: 'better-sqlite3',
      database: ':memory:',
      synchronize: true,
      logging: false,
      entities: [SubscriberUser],
      ...options,
    },
    'default'
  ) as Promise<DataSource>;
}
