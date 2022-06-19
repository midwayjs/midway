import { Config, Init, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { DataSourceManager } from '@midwayjs/core';
import { MikroORM, IDatabaseDriver, Connection } from '@mikro-orm/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MikroDataSourceManager extends DataSourceManager<
  MikroORM<IDatabaseDriver<Connection>>
> {
  @Config('mikro')
  mikroConfig;

  @Init()
  async init() {
    await this.initDataSource(this.mikroConfig);
  }

  getName(): string {
    return 'mikro';
  }

  protected addEntities(entities: any[], dataSourceName: string): void {}

  protected async createDataSource(
    config: any,
    dataSourceName: string
  ): Promise<MikroORM<IDatabaseDriver<Connection>>> {
    return MikroORM.init(config);
  }

  protected async checkConnected(
    dataSource: MikroORM<IDatabaseDriver<Connection>>
  ): Promise<boolean> {
    return dataSource.isConnected();
  }

  protected async destroyDataSource(
    dataSource: MikroORM<IDatabaseDriver<Connection>>
  ) {
    if (dataSource.isConnected()) {
      await dataSource.close();
    }
  }
}
