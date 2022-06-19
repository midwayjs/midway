import { Provide, Config, Init, Scope, ScopeEnum, ApplicationContext } from '@midwayjs/decorator';
import { DataSourceManager, IMidwayContainer } from '@midwayjs/core';
import { DataSource } from 'typeorm';

@Provide()
@Scope(ScopeEnum.Singleton)
export class TypeORMDataSourceManager extends DataSourceManager<DataSource> {

  @Config('typeorm')
  typeormConfig;

  @ApplicationContext()
  applicationContext: IMidwayContainer;

  @Init()
  async init() {
    await this.initDataSource(this.typeormConfig);
  }

  getName(): string {
    return 'typeorm';
  }

  protected addEntities(entities: any[], dataSourceName: string): void {}

  protected async createDataSource(config: any, dataSourceName: string): Promise<DataSource> {
    // const newSubscribers = [];
    // if (config.subscribers) {
    //   const originSubscribers = [];
    //   // get event model
    //   for (const eventModule of config.subscribers) {
    //     if (isProvide(eventModule)) {
    //       const module = await this.applicationContext.getAsync(eventModule);
    //       newSubscribers.push(module);
    //     } else {
    //       originSubscribers.push(eventModule);
    //     }
    //   }
    //   config.subscribers = originSubscribers;
    // }

    const dataSource = new DataSource(config);
    // if (newSubscribers.length > 0) {
    //   // get event model
    //   for (const eventModule of newSubscribers) {
    //     dataSource.subscribers.push(eventModule);
    //   }
    // }
    await dataSource.initialize();
    return dataSource;
  }

  protected checkConnected(dataSource: DataSource): boolean {
    return dataSource.isInitialized;
  }

  protected async destroyDataSource(dataSource: DataSource) {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}
