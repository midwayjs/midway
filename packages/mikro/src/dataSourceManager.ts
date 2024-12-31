import {
  Config,
  Init,
  Provide,
  Scope,
  Inject,
  ScopeEnum,
  DataSourceManager,
  MidwayLoggerService,
} from '@midwayjs/core';
import { MikroORM, IDatabaseDriver, Connection } from '@mikro-orm/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MikroDataSourceManager extends DataSourceManager<
  MikroORM<IDatabaseDriver<Connection>>
> {
  @Config('mikro')
  mikroConfig;

  @Inject()
  baseDir: string;

  @Inject()
  loggerService: MidwayLoggerService;

  @Init()
  async init() {
    await this.initDataSource(this.mikroConfig, {
      baseDir: this.baseDir,
      concurrent: true,
    });
  }

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
