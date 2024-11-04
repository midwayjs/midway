/**
 * 数据源管理器实现
 */
import { extend } from '../util/extend';
import { MidwayCommonError, MidwayParameterError } from '../error';
import { run } from '@midwayjs/glob';
import { join, parse } from 'path';
import { Types } from '../util/types';
import { DEFAULT_PATTERN, IGNORE_PATTERN } from '../constants';
import { debuglog } from 'util';
import { loadModule } from '../util';
import { ModuleLoadType, DataSourceManagerConfigOption } from '../interface';
import { Inject } from '../decorator';
import { MidwayEnvironmentService } from '../service/environmentService';
import { MidwayPriorityManager } from './priorityManager';

const debug = debuglog('midway:debug');

export abstract class DataSourceManager<
  T,
  ConnectionOpts extends Record<string, any> = Record<string, any>
> {
  protected dataSource: Map<string, T> = new Map();
  protected options: DataSourceManagerConfigOption<ConnectionOpts> = {};
  protected modelMapping = new WeakMap();
  private innerDefaultDataSourceName: string;
  protected dataSourcePriority: Record<string, string> = {};

  @Inject()
  protected appDir: string;

  @Inject()
  protected environmentService: MidwayEnvironmentService;

  @Inject()
  protected priorityManager: MidwayPriorityManager;

  protected async initDataSource(
    dataSourceConfig: DataSourceManagerConfigOption<ConnectionOpts>,
    baseDirOrOptions:
      | {
          baseDir: string;
          entitiesConfigKey?: string;
        }
      | string
  ): Promise<void> {
    this.options = dataSourceConfig;
    if (!this.options.dataSource) {
      throw new MidwayParameterError(
        '[DataSourceManager] must set options.dataSource.'
      );
    }

    if (typeof baseDirOrOptions === 'string') {
      baseDirOrOptions = {
        baseDir: baseDirOrOptions,
        entitiesConfigKey: 'entities',
      };
    }

    for (const dataSourceName in dataSourceConfig.dataSource) {
      const dataSourceOptions = dataSourceConfig.dataSource[dataSourceName];
      const userEntities = dataSourceOptions[
        baseDirOrOptions.entitiesConfigKey
      ] as any[];
      if (userEntities) {
        const entities = new Set();
        // loop entities and glob files to model
        for (const entity of userEntities) {
          if (typeof entity === 'string') {
            // string will be glob file
            const models = await globModels(
              entity,
              baseDirOrOptions.baseDir,
              this.environmentService?.getModuleLoadType()
            );
            for (const model of models) {
              entities.add(model);
              this.modelMapping.set(model, dataSourceName);
            }
          } else {
            // model will be added to array
            entities.add(entity);
            this.modelMapping.set(entity, dataSourceName);
          }
        }
        (dataSourceOptions[baseDirOrOptions.entitiesConfigKey] as any) =
          Array.from(entities);
        debug(
          `[core]: DataManager load ${
            dataSourceOptions[baseDirOrOptions.entitiesConfigKey].length
          } models from ${dataSourceName}.`
        );
      }
      // create data source
      const opts = {
        cacheInstance: dataSourceConfig.cacheInstance, // will default true
        validateConnection: dataSourceConfig.validateConnection,
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

  public getAllDataSources() {
    return this.dataSource;
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
    options?: {
      validateConnection?: boolean;
      cacheInstance?: boolean | undefined;
    }
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

  /**
   * Call destroyDataSource() on all data sources
   */
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

  public getDataSourcePriority(name: string) {
    return this.priorityManager.getPriority(this.dataSourcePriority[name]);
  }

  public isHighPriority(name: string) {
    return this.priorityManager.isHighPriority(this.dataSourcePriority[name]);
  }

  public isMediumPriority(name: string) {
    return this.priorityManager.isMediumPriority(this.dataSourcePriority[name]);
  }

  public isLowPriority(name: string) {
    return this.priorityManager.isLowPriority(this.dataSourcePriority[name]);
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

export async function globModels(
  globString: string,
  appDir: string,
  loadMode?: ModuleLoadType
) {
  const pattern = formatGlobString(globString);

  const models = [];
  // string will be glob file
  const files = run(pattern, {
    cwd: appDir,
    ignore: IGNORE_PATTERN,
  });
  for (const file of files) {
    const exports = await loadModule(file, {
      loadMode,
    });
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
