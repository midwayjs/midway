import {
  Provide,
  Config,
  Init,
  Scope,
  ScopeEnum,
  Logger,
} from '@midwayjs/decorator';
import { DataSourceManager } from '@midwayjs/core';
import { Sequelize } from 'sequelize-typescript';

@Provide()
@Scope(ScopeEnum.Singleton)
export class SequelizeDataSourceManager extends DataSourceManager<Sequelize> {
  @Config('sequelize')
  sequelizeConfig;

  @Logger('coreLogger')
  logger;

  @Init()
  async init(): Promise<void> {
    await this.initDataSource(this.sequelizeConfig);
  }

  getName(): string {
    return 'sequelize';
  }

  protected async createDataSource(
    config: any,
    dataSourceName: string
  ): Promise<Sequelize> {
    const dataSource = new Sequelize(config);
    this.logger.info(`[midway:sequelize] ${dataSourceName} connecting`);
    try {
      await dataSource.authenticate();
    } catch (error) {
      this.logger.error(
        `[midway:sequelize] ${dataSourceName} error: %s`,
        error
      );
      this.logger.error(error);
    }

    this.logger.info(`[midway:sequelize] ${dataSourceName} connect success`);
    return dataSource;
  }

  protected async checkConnected(dataSource: Sequelize) {
    await dataSource.authenticate();
  }

  protected async destroyDataSource(dataSource: Sequelize) {
    try {
      await (dataSource && dataSource.close());
    } catch (error) {
      this.logger.error('[midway:sequelize] sequelize quit failed.', error);
    }
  }
}
