import {
  Config,
  DataSourceManager,
  ILogger,
  Init,
  Inject,
  Logger,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import Realm, { ConnectOptions, isBone } from 'leoric';
import { LeoricConfigOption } from './interface';

@Provide()
@Scope(ScopeEnum.Singleton)
export class LeoricDataSourceManager extends DataSourceManager<
  Realm,
  ConnectOptions
> {
  @Config('leoric')
  leoricConfig: LeoricConfigOption;

  @Logger('coreLogger')
  coreLogger: ILogger;

  @Inject()
  baseDir: string;

  @Init()
  async init() {
    if (Object.keys(this.leoricConfig.dataSource).length > 1) {
      for (const dataSource of Object.values(this.leoricConfig.dataSource)) {
        dataSource.subclass = true;
      }
    }
    await this.initDataSource(this.leoricConfig, {
      baseDir: this.baseDir,
      entitiesConfigKey: 'models',
      concurrent: true,
    });
  }

  getName(): string {
    return 'leoric';
  }

  protected async createDataSource(
    config: any,
    dataSourceName: string
  ): Promise<Realm> {
    const { sync, models, ...options } = config;
    const realm = new Realm({
      ...options,
      models: models.filter(el => isBone(el)),
    });
    await realm.connect();
    this.coreLogger.info('[midway:leoric] connecting and start');
    if (sync) await realm.sync();
    return realm;
  }

  protected async checkConnected(dataSource: Realm): Promise<boolean> {
    try {
      await dataSource.connect();
      return true;
    } catch (err) {
      this.coreLogger.error(err);
      return false;
    }
  }

  protected async destroyDataSource(dataSource: Realm) {
    if (await this.checkConnected(dataSource)) {
      await dataSource.disconnect();
    }
  }
}
