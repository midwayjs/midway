import {
  Config,
  Init,
  Logger,
  Provide,
  Scope,
  ScopeEnum,
  listModule,
} from '@midwayjs/decorator';
import { DataSourceManager, ILogger } from '@midwayjs/core';
import { Sequelize } from 'sequelize-typescript';

@Provide()
@Scope(ScopeEnum.Singleton)
export class SequelizeDataSourceManager extends DataSourceManager<Sequelize> {
  @Config('sequelize')
  sequelizeConfig;

  @Logger('coreLogger')
  coreLogger: ILogger;

  @Init()
  async init() {
    if (this.sequelizeConfig.options) {
      this.coreLogger.warn(
        '[midway:sequelize] sequelize.options is deprecated, please use new config format.'
      );
      this.sequelizeConfig.options.sync = this.sequelizeConfig.sync || false;
      // legacy config
      this.sequelizeConfig.dataSource = {
        default: this.sequelizeConfig.options,
      };
    }
    await this.initDataSource(this.sequelizeConfig);
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
    } else {
      const entities = listModule('sequelize:core');
      client.addModels(entities);
    }
    await client.authenticate();

    if (config.sync) {
      await client.sync();
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
