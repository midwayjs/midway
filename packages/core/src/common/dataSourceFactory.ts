/**
 * 数据源工厂实现
 */
import { extend } from '../util/extend';
// import * as assert from 'assert';
import { MidwayCommonError } from '../error';

export abstract class DataSourceManager<T> {
  protected dataSource: Map<string, T> = new Map();
  protected options = {};
  protected dataSourceNameMap = new Map();

  protected async initDataSource(options: any = {}): Promise<void> {
    this.options = options;
    if (options.dataSource) {
      for (const id of Object.keys(options.dataSource)) {
        await this.createDataSource(options. [id], id);
      }
    } else {
      throw new MidwayCommonError('DataSource must set options.dataSource.');
    }
  }

  public getDataSource(dataSourceName: string) {
    return this.dataSource.get(dataSourceName);
  }

  public getDataSourceByGroup(dataSourceName: string): T[] {
    return this.dataSource.get(dataSourceName);
  }


  public hasDataSource(id: string): boolean {
    return this.dataSource.has(id);
  }

  public async createInstance(config, clientName?): Promise<T | void> {
    // options.default will be merge in to options.clients[id]
    config = extend(true, {}, this.options['default'], config);
    const client = await this.createDataSource(config, clientName);
    if (client) {
      if (clientName) {
        this.dataSource.set(clientName, client);
      }
      return client;
    }
  }

  public abstract getName(): string;
  protected abstract createDataSource(
    config,
    dataSourceName: string
  ): Promise<T | void> | (T | void);
  protected async destroyDataSource(client: T): Promise<void> {}

  public async stop(): Promise<void> {
    for (const value of this.dataSource.values()) {
      await this.destroyDataSource(value);
    }
  }

  public bindEntityWithDataSource(entity, dataSourceOrGroup: string) {
    this.dataSourceNameMap.set();
  }
}
