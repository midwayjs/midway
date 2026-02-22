import {
  Config,
  Init,
  Inject,
  Provide,
  Scope,
  ScopeEnum,
  ServiceFactory,
  delegateTargetPrototypeMethod,
  MidwayCommonError,
  MidwayTraceService,
} from '@midwayjs/core';
import * as TableStore from 'tablestore';
import { TableStoreClient } from './interface';

@Provide()
@Scope(ScopeEnum.Singleton)
export class TableStoreServiceFactory extends ServiceFactory<TableStoreClient> {
  @Config('tableStore')
  tableStoreConfig;

  @Inject()
  protected traceService: MidwayTraceService;

  @Config('tableStore.tracing.meta')
  protected traceMetaResolver;

  @Config('tableStore.tracing.enable')
  protected traceEnabled;

  @Config('tableStore.tracing.injector')
  protected traceInjector;

  @Init()
  async init() {
    await this.initClients(this.tableStoreConfig, {
      concurrent: true,
    });
  }

  async createClient(config): Promise<TableStoreClient> {
    const client = new TableStore.Client(config) as any;
    this.bindTraceContext(client);
    return client;
  }

  protected bindTraceContext(client: any) {
    if (!client || !this.traceService) {
      return;
    }

    const rawMakeRequest = client.makeRequest?.bind(client);
    if (!rawMakeRequest) {
      return;
    }

    client.makeRequest = (...args) => {
      if (typeof args[1] === 'function' || typeof args[2] === 'function') {
        return rawMakeRequest(...args);
      }
      const operation = args?.[0] || 'request';
      const rawCarrier =
        typeof this.traceInjector === 'function'
          ? this.traceInjector({
              request: args,
              custom: {
                operation: String(operation),
              },
            })
          : {};
      const carrier =
        rawCarrier && typeof rawCarrier === 'object' ? rawCarrier : {};
      return this.traceService.runWithExitSpan(
        `tablestore.${String(operation).toLowerCase()}`,
        {
          enable: this.traceEnabled !== false,
          carrier,
          attributes: {
            'midway.protocol': 'tablestore',
            'midway.tablestore.operation': String(operation),
          },
          meta: this.traceMetaResolver,
          metaArgs: {
            carrier,
            request: args,
            custom: {
              operation: String(operation),
            },
          },
        },
        async () => {
          return rawMakeRequest(...args);
        }
      );
    };
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
    this.instance = this.serviceFactory.get(
      this.serviceFactory.getDefaultClientName?.() || 'default'
    );
    if (!this.instance) {
      throw new MidwayCommonError('TableStore default instance not found.');
    }
  }
}

export interface TableStoreService extends TableStoreClient {
  // empty
}

delegateTargetPrototypeMethod(TableStoreService, [TableStore.Client]);
