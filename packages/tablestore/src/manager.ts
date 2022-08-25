import {
  Config,
  Init,
  Inject,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator';
import * as TableStore from 'tablestore';
import {
  ServiceFactory,
  delegateTargetPrototypeMethod,
  MidwayCommonError,
} from '@midwayjs/core';
import { TableStoreClient } from './interface';

@Provide()
@Scope(ScopeEnum.Singleton)
export class TableStoreServiceFactory extends ServiceFactory<TableStoreClient> {
  @Config('tableStore')
  tableStoreConfig;

  @Init()
  async init() {
    await this.initClients(this.tableStoreConfig);
  }

  async createClient(config): Promise<TableStoreClient> {
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
  private serviceFactory: TableStoreServiceFactory;

  private instance: TableStoreClient;

  @Init()
  async init() {
    this.instance = this.serviceFactory.get('default');
    if (!this.instance) {
      throw new MidwayCommonError('TableStore default instance not found.');
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TableStoreService extends TableStoreClient {
  // empty
}

delegateTargetPrototypeMethod(TableStoreService, [TableStore.Client]);
