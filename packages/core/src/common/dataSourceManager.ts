/**
 * 数据源管理器实现
 */
import { extend } from '../util/extend';
import { MidwayParameterError } from '../error';
import { run } from '@midwayjs/glob';
import { join } from 'path';
import { Types } from '@midwayjs/decorator';

const DEFAULT_PATTERN = ['**/**.ts', '**/**.js'];

export interface DataSourceConfig<SourceName extends PropertyKey = string> {
  dataSource: DataSource<SourceName>;
  [prop: string]: any;
}
export type DataSource<SourceName extends PropertyKey = string> = Record<
  SourceName,
  DataSourceItem
>;
export interface DataSourceItem {
  [prop: string]: any;
}

export abstract class DataSourceManager<
  T,
  SourceName extends PropertyKey = string
> {
  protected dataSource: Map<SourceName, T> = new Map();
  protected options = {};
  protected modelMapping = new WeakMap();

  protected async initDataSource(
    options: DataSourceConfig<SourceName>,
    appDir: string
  ): Promise<void> {
    this.options = options;
    if (options.dataSource) {
      for (const dataSourceName in options.dataSource) {
        const dataSourceOptions: DataSourceItem =
          options.dataSource[dataSourceName];
        if (dataSourceOptions['entities']) {
          const entities = new Set();
          // loop entities and glob files to model
          for (const entity of dataSourceOptions['entities']) {
            if (typeof entity === 'string') {
              // string will be glob file
              const models = globModels(entity, appDir);
              for (const model of models) {
                entities.add(model);
                this.modelMapping.set(model, dataSourceName);
              }
            } else {
              // model will be add to array
              entities.add(entity);
              this.modelMapping.set(entity, dataSourceName);
            }
          }
          dataSourceOptions['entities'] = Array.from(entities);
        }
        // create data source
        await this.createInstance(dataSourceOptions, dataSourceName);
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
  public getDataSource(dataSourceName: SourceName): T | undefined {
    return this.dataSource.get(dataSourceName);
  }

  /**
   * check data source has exists
   * @param dataSourceName
   */
  public hasDataSource(dataSourceName: SourceName): boolean {
    return this.dataSource.has(dataSourceName);
  }

  public getDataSourceNames(): SourceName[] {
    return Array.from(this.dataSource.keys());
  }

  /**
   * check the data source is connected
   * @param dataSourceName
   */
  public async isConnected(dataSourceName: SourceName): Promise<boolean> {
    return this.checkConnected(this.getDataSource(dataSourceName));
  }

  public async createInstance(
    config: DataSourceItem,
    clientName: SourceName
  ): Promise<T | void> {
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

  /**
   * get data source name by model or repository
   * @param modelOrRepository
   */
  public getDataSourceNameByModel(modelOrRepository: any): string | undefined {
    return this.modelMapping.get(modelOrRepository);
  }

  public abstract getName(): string;
  protected abstract createDataSource(
    config: DataSourceItem,
    dataSourceName: SourceName
  ): Promise<T | void> | (T | void);
  protected abstract checkConnected(dataSource: T): Promise<boolean>;
  protected abstract destroyDataSource(dataSource: T): Promise<void>;

  public async stop(): Promise<void> {
    for (const value of this.dataSource.values()) {
      await this.destroyDataSource(value);
    }
    this.dataSource.clear();
  }
}

export function globModels(globString: string, appDir: string) {
  const cwd = join(appDir, globString);
  const models = [];
  // string will be glob file
  const files = run(DEFAULT_PATTERN, {
    cwd,
  });
  for (const file of files) {
    const exports = require(file);
    if (Types.isClass(exports)) {
      models.push(exports);
    } else {
      for (const m in exports) {
        const module = exports[m];
        if (Types.isClass(module)) {
          models.push(module);
        }
      }
    }
  }
  return models;
}
