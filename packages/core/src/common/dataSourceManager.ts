/**
 * 数据源管理器实现
 */
import { extend } from '../util/extend';
import { MidwayCommonError, MidwayParameterError } from '../error';
import { run } from '@midwayjs/glob';
import { join, parse } from 'path';
import { Types } from '../util/types';
import { DEFAULT_PATTERN, IGNORE_PATTERN } from '../constants';

export abstract class DataSourceManager<T> {
  protected dataSource: Map<string, T> = new Map();
  protected options = {};
  protected modelMapping = new WeakMap();
  private innerDefaultDataSourceName: string;

  protected async initDataSource(options: any, appDir: string): Promise<void> {
    this.options = options;
    if (!options.dataSource) {
      throw new MidwayParameterError(
        '[DataSourceManager] must set options.dataSource.'
      );
    }

    for (const dataSourceName in options.dataSource) {
      const dataSourceOptions = options.dataSource[dataSourceName];
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
      const opts: CreateDataSourceInstanceOptions = {
        cacheInstance: options.cacheInstance, // will default true
        validateConnection: options.validateConnection,
      };
      await this.createInstance(dataSourceOptions, dataSourceName, opts);
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

  public getDataSourceNames() {
    return Array.from(this.dataSource.keys());
  }

  /**
   * check the data source is connected
   * @param dataSourceName
   */
  public async isConnected(dataSourceName: string): Promise<boolean> {
    const inst = this.getDataSource(dataSourceName);
    return inst ? this.checkConnected(inst) : false;
  }

  public async createInstance(
    config: any,
    clientName: any,
    options?: CreateDataSourceInstanceOptions
  ): Promise<T | void> {
    const cache =
      options && typeof options.cacheInstance === 'boolean'
        ? options.cacheInstance
        : true;
    const validateConnection = (options && options.validateConnection) || false;

    // options.clients[id] will be merged with options.default
    const configNow = extend(true, {}, this.options['default'], config);
    const client = await this.createDataSource(configNow, clientName);
    if (cache && clientName && client) {
      this.dataSource.set(clientName, client);
    }

    if (validateConnection) {
      if (!client) {
        throw new MidwayCommonError(
          `[DataSourceManager] ${clientName} initialization failed.`
        );
      }

      const connected = await this.checkConnected(client);
      if (!connected) {
        throw new MidwayCommonError(
          `[DataSourceManager] ${clientName} is not connected.`
        );
      }
    }

    return client;
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
    config,
    dataSourceName: string
  ): Promise<T | void> | (T | void);
  protected abstract checkConnected(dataSource: T): Promise<boolean>;
  protected abstract destroyDataSource(dataSource: T): Promise<void>;

  public async stop(): Promise<void> {
    const arr = Array.from(this.dataSource.values());
    await Promise.all(
      arr.map(dbh => {
        return this.destroyDataSource(dbh);
      })
    );
    this.dataSource.clear();
  }

  public getDefaultDataSourceName(): string {
    if (this.innerDefaultDataSourceName === undefined) {
      if (this.options['defaultDataSourceName']) {
        this.innerDefaultDataSourceName = this.options['defaultDataSourceName'];
      } else if (this.dataSource.size === 1) {
        // Set the default source name when there is only one data source
        this.innerDefaultDataSourceName = Array.from(this.dataSource.keys())[0];
      } else {
        // Set empty string for cache
        this.innerDefaultDataSourceName = '';
      }
    }
    return this.innerDefaultDataSourceName;
  }
}

export function formatGlobString(globString: string): string[] {
  let pattern;

  if (!/^\*/.test(globString)) {
    globString = '/' + globString;
  }
  const parsePattern = parse(globString);
  if (parsePattern.base && (/\*/.test(parsePattern.base) || parsePattern.ext)) {
    pattern = [globString];
  } else {
    pattern = [...DEFAULT_PATTERN.map(p => join(globString, p))];
  }
  return pattern;
}

export function globModels(globString: string, appDir: string) {
  const pattern = formatGlobString(globString);

  const models = [];
  // string will be glob file
  const files = run(pattern, {
    cwd: appDir,
    ignore: IGNORE_PATTERN,
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

export interface CreateDataSourceInstanceOptions {
  /**
   * @default false
   */
  validateConnection?: boolean;
  /**
   * @default true
   */
  cacheInstance?: boolean | undefined;
}
