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
import { DataSource } from 'typeorm';
import { TypeORMLogger } from './logger';

@Provide()
@Scope(ScopeEnum.Singleton)
export class TypeORMDataSourceManager extends DataSourceManager<DataSource> {
  @Config('typeorm')
  typeormConfig;

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
    if (config['migrations']) {
      delete config['migrations'];
    }
    if (config['logging'] === undefined) {
      config['logger'] = new TypeORMLogger(
        this.loggerService.getLogger('typeormLogger')
      );
    }

    const { customDataSourceClass, ...otherConfig } = config;

    let dataSource: DataSource;
    if (customDataSourceClass) {
      dataSource = new customDataSourceClass(otherConfig);
    } else {
      dataSource = new DataSource(otherConfig);
    }

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
