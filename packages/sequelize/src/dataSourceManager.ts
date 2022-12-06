import {
  Config,
  Init,
  Logger,
  Provide,
  Scope,
  Inject,
  ScopeEnum,
  listModule,
  DataSourceManager,
  ILogger,
} from '@midwayjs/core';
import { Sequelize } from 'sequelize-typescript';

@Provide()
@Scope(ScopeEnum.Singleton)
export class SequelizeDataSourceManager extends DataSourceManager<Sequelize> {
  @Config('sequelize')
  sequelizeConfig;

  @Logger('coreLogger')
  coreLogger: ILogger;

  @Inject()
  baseDir: string;

  @Init()
  async init() {
    await this.initDataSource(this.sequelizeConfig, this.baseDir);
  }

  getName(): string {
    return 'sequelize';
  }

  protected async createDataSource(
    config: any,
    dataSourceName: string
  ): Promise<Sequelize> {
    const client = new Sequelize(config);
    const entities = config['entities'];
    if (entities && entities.length > 0) {
      client.addModels(entities);
    }

    // 兼容老写法，但是这里可能有问题，会添加到所有的数据源之中
    const listEntities = listModule('sequelize:core');
    client.addModels(listEntities);

    await client.authenticate();

    if (config.sync) {
      await client.sync(config.syncOptions);
    }

    this.coreLogger.info('[midway:sequelize] connecting and start');
    return client;
  }

  protected async checkConnected(dataSource: Sequelize): Promise<boolean> {
    try {
      await dataSource.authenticate();
      return true;
    } catch (err) {
      this.coreLogger.error(err);
      return false;
    }
  }

  protected async destroyDataSource(dataSource: Sequelize) {
    if (await this.checkConnected(dataSource)) {
      await dataSource.close();
    }
  }
}
