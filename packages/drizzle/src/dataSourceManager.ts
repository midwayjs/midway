import {
  Config,
  Init,
  Logger,
  Provide,
  Scope,
  Inject,
  ScopeEnum,
  DataSourceManager,
  ILogger,
} from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class DrizzleDataSourceManager extends DataSourceManager<any, any> {
  @Config('drizzle')
  drizzleConfig;

  @Logger('coreLogger')
  coreLogger: ILogger;

  @Inject()
  baseDir: string;

  @Init()
  async init() {
    await this.initDataSource(this.drizzleConfig, this.baseDir);
  }

  getName(): string {
    return 'drizzle';
  }

  async createInstance(
    config: any,
    dataSourceName: string,
    options: any
  ): Promise<any> {
    const cache =
      options && typeof options.cacheInstance === 'boolean'
        ? options.cacheInstance
        : true;
    // const validateConnection = (options && options.validateConnection) || false;
    if (cache) {
      this.addDataSource(dataSourceName, config);
    }

    return config;
  }

  protected async createDataSource(
    config: any,
    dataSourceName: string
  ): Promise<unknown> {
    return config;
  }

  protected async checkConnected(dataSource: any): Promise<boolean> {
    return true;
  }

  protected async destroyDataSource(dataSource: any) {}
}
