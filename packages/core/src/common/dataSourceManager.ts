/**
 * 数据源管理器实现
 */
import { extend } from '../util/extend';
import { MidwayParameterError } from '../error';

export abstract class DataSourceManager<T> {
  protected dataSource: Map<string, T> = new Map();
  protected options = {};

  protected async initDataSource(options: any = {}): Promise<void> {
    this.options = options;
    if (options.dataSource) {
      for (const dataSourceName in options.dataSource) {
        // create entity and bind to data source
        if (options.dataSource[dataSourceName]['entities']) {
          this.addEntities(
            options.dataSource[dataSourceName]['entities'],
            dataSourceName
          );
        }
        // create data source
        await this.createInstance(
          options.dataSource[dataSourceName],
          dataSourceName
        );
      }
    } else {
      throw new MidwayParameterError(
        'DataSourceManager must set options.dataSource.'
      );
    }
  }

  /**
   * get a data source instance
   * @param dataSourceName
   */
  public getDataSource(dataSourceName: string) {
    return this.dataSource.get(dataSourceName);
  }

  /**
   * check data source has exists
   * @param dataSourceName
   */
  public hasDataSource(dataSourceName: string): boolean {
    return this.dataSource.has(dataSourceName);
  }

  /**
   * check the data source is connected
   * @param dataSourceName
   */
  public isConnected(dataSourceName: string): boolean {
    return this.checkConnected(this.getDataSource(dataSourceName));
  }

  public async createInstance(config, clientName): Promise<T | void> {
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
  protected abstract addEntities(entities: any[], dataSourceName: string): void;
  protected abstract createDataSource(
    config,
    dataSourceName: string
  ): Promise<T | void> | (T | void);
  protected abstract checkConnected(dataSource: T): boolean;
  protected async destroyDataSource(dataSource: T): Promise<void> {}

  public async stop(): Promise<void> {
    for (const value of this.dataSource.values()) {
      await this.destroyDataSource(value);
    }
  }
}
