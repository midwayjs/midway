import {
  Provide,
  Config,
  Init,
  Scope,
  ScopeEnum,
  ApplicationContext,
} from '@midwayjs/decorator';
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

  protected async createDataSource(
    config: any,
    dataSourceName: string
  ): Promise<DataSource> {
    const dataSource = new DataSource(config);
    await dataSource.initialize();
    return dataSource;
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
