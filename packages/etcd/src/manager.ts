import {
  Config,
  Init,
  Inject,
  Logger,
  Provide,
  Scope,
  ScopeEnum,
  ServiceFactory,
  MidwayCommonError,
  delegateTargetAllPrototypeMethod,
  MidwayTraceService,
} from '@midwayjs/core';
import { Etcd3, IOptions } from 'etcd3';

@Provide()
@Scope(ScopeEnum.Singleton)
export class ETCDServiceFactory extends ServiceFactory<Etcd3> {
  @Config('etcd')
  etcdConfig;

  @Init()
  async init() {
    await this.initClients(this.etcdConfig, {
      concurrent: true,
    });
  }

  @Logger('coreLogger')
  logger;

  @Inject()
  protected traceService: MidwayTraceService;

  async createClient(config: IOptions): Promise<Etcd3> {
    this.logger.info('[midway:etcd] init %s', config.hosts);
    const client = new Etcd3(config);
    this.bindTraceContext(client);
    return client;
  }

  protected bindTraceContext(client: Etcd3) {
    if (!client || !this.traceService) {
      return;
    }

    const pool = (client as any).pool;
    const rawExec = pool?.exec?.bind(pool);
    if (!rawExec) {
      return;
    }

    pool.exec = (
      serviceName: string,
      method: string,
      payload: unknown,
      options?: any
    ) => {
      return this.traceService.runWithExitSpan(
        `etcd.${String(method).toLowerCase()}`,
        {
          carrier: {},
          attributes: {
            'midway.protocol': 'etcd',
            'midway.etcd.service': String(serviceName),
            'midway.etcd.method': String(method),
          },
        },
        async () => {
          return rawExec(serviceName, method, payload, options);
        }
      );
    };
  }

  getName() {
    return 'etcd';
  }

  async destroyClient(client: Etcd3) {
    await client.close();
  }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class ETCDService implements Etcd3 {
  @Inject()
  private serviceFactory: ETCDServiceFactory;

  private instance: Etcd3;

  @Init()
  async init() {
    this.instance = this.serviceFactory.get(
      this.serviceFactory.getDefaultClientName?.() || 'default'
    );
    if (!this.instance) {
      throw new MidwayCommonError('etcd default instance not found.');
    }
  }
}

export interface ETCDService extends Etcd3 {
  // empty
}

delegateTargetAllPrototypeMethod(ETCDService, Etcd3);
