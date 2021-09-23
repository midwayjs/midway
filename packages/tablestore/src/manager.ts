import {
  Config,
  Init,
  Inject,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator';
import * as TableStore from 'tablestore';
import { ServiceFactory, delegateTargetPrototypeMethod } from '@midwayjs/core';
import { TableStoreClient } from './interface';

@Provide()
@Scope(ScopeEnum.Singleton)
export class TableStoreServiceFactory<
  T = TableStoreClient
> extends ServiceFactory<T> {
  @Config('tableStore')
  tableStoreConfig;

  @Init()
  async init() {
    await this.initClients(this.tableStoreConfig);
  }

  async createClient(config): Promise<T> {
    return new TableStore.Client(config) as any;
  }

  getName() {
    return 'tableStore';
  }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class TableStoreService implements TableStoreClient {
  @Inject()
  private serviceFactory: TableStoreServiceFactory<TableStoreClient>;

  // @ts-expect-error used
  private instance: OSS;

  @Init()
  async init() {
    this.instance = this.serviceFactory.get('default');
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TableStoreService extends TableStoreClient {
  // empty
}

delegateTargetPrototypeMethod(TableStoreService, [TableStore.Client]);
