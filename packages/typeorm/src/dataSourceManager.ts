import {
  Provide,
  Config,
  Init,
  Scope,
  Inject,
  ScopeEnum,
  ApplicationContext,
  DataSourceManager,
  IMidwayContainer,
  MidwayLoggerService,
} from '@midwayjs/core';
import { DataSource, EntitySubscriberInterface } from 'typeorm';
import { TypeORMLogger } from './logger';
import { typeormConfigOptions } from './interface';

@Provide()
@Scope(ScopeEnum.Singleton)
export class TypeORMDataSourceManager extends DataSourceManager<DataSource> {
  @Config('typeorm')
  typeormConfig: typeormConfigOptions;

  @ApplicationContext()
  applicationContext: IMidwayContainer;

  @Inject()
  loggerService: MidwayLoggerService;

  @Init()
  async init() {
    await this.initDataSource(this.typeormConfig, {
      concurrent: true,
    });
  }

  getName(): string {
    return 'typeorm';
  }

  protected async createDataSource(
    config: any,
    dataSourceName: string
  ): Promise<DataSource> {
    if (!this.typeormConfig['allowExecuteMigrations']) {
      if (config['migrations']) {
        delete config['migrations'];
      }
    }

    if (config['logging'] === undefined) {
      config['logger'] = new TypeORMLogger(
        this.loggerService.getLogger('typeormLogger')
      );
    }

    const { customDataSourceClass, ...otherConfig } = config;
    const subscriberClasses = this.filterSubscriberClasses(
      otherConfig.subscribers
    );
    otherConfig.subscribers = this.filterTypeORMManagedSubscribers(
      otherConfig.subscribers
    );
    otherConfig.invalidWhereValuesBehavior = {
      null: 'ignore',
      undefined: 'ignore',
      ...otherConfig.invalidWhereValuesBehavior,
    };

    let dataSource: DataSource;
    if (customDataSourceClass) {
      dataSource = new customDataSourceClass(otherConfig);
    } else {
      dataSource = new DataSource(otherConfig);
    }

    await dataSource.initialize();
    dataSource.subscribers.push(
      ...(await this.createSubscriberInstances(subscriberClasses))
    );
    return dataSource;
  }

  private filterSubscriberClasses(subscribers: any) {
    return this.toSubscriberArray(subscribers).filter(
      subscriber => typeof subscriber === 'function'
    );
  }

  private filterTypeORMManagedSubscribers(subscribers: any) {
    return this.toSubscriberArray(subscribers).filter(
      subscriber => typeof subscriber !== 'function'
    );
  }

  private toSubscriberArray(subscribers: any) {
    if (!subscribers) {
      return [];
    }

    return Array.isArray(subscribers)
      ? subscribers
      : Object.values(subscribers);
  }

  private async createSubscriberInstances(subscriberClasses: any[]) {
    return Promise.all(
      subscriberClasses.map(async subscriberClass => {
        try {
          return (await this.applicationContext.getAsync(
            subscriberClass
          )) as EntitySubscriberInterface;
        } catch {
          return new subscriberClass() as EntitySubscriberInterface;
        }
      })
    );
  }

  protected async checkConnected(dataSource: DataSource) {
    return dataSource.isInitialized;
  }

  protected async destroyDataSource(dataSource: DataSource) {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}
