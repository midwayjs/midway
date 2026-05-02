import midwayCore, {
  type MidwayLoggerService as MidwayLoggerServiceType,
} from '@midwayjs/core';
import { MikroORM, IDatabaseDriver, Connection } from '@mikro-orm/core';

const { Config, Init, Provide, Scope, Inject, ScopeEnum } = midwayCore;

@Provide()
@Scope(ScopeEnum.Singleton)
/**
 * Creates and owns MikroORM v7 data sources for the Midway application.
 */
export class MikroDataSourceManager extends midwayCore.DataSourceManager<
  MikroORM<IDatabaseDriver<Connection>>
> {
  @Config('mikro')
  mikroConfig;

  @Inject('midwayLoggerService')
  loggerService: MidwayLoggerServiceType;

  @Init()
  async init() {
    await this.initDataSource(this.mikroConfig, {
      concurrent: true,
    });
  }

  /**
   * Return the Midway data-source namespace for this component.
   */
  getName(): string {
    return 'mikro';
  }

  protected async createDataSource(
    config: any,
    dataSourceName: string
  ): Promise<MikroORM<IDatabaseDriver<Connection>>> {
    if (config.logger && typeof config.logger === 'string') {
      const logger = this.loggerService.getLogger(config.logger);
      config.logger = message => {
        logger.info(message);
      };
    }
    // https://mikro-orm.io/docs/usage-with-nestjs#multiple-database-connections
    if (!config.contextName) {
      config.contextName = dataSourceName;
    }
    config.registerRequestContext = config.registerRequestContext ?? false;
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
