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
} from '@midwayjs/core';
import { Etcd3, IOptions } from 'etcd3';

@Provide()
@Scope(ScopeEnum.Singleton)
export class ETCDServiceFactory extends ServiceFactory<Etcd3> {
  @Config('etcd')
  etcdConfig;

  @Init()
  async init() {
    await this.initClients(this.etcdConfig);
  }

  @Logger('coreLogger')
  logger;

  async createClient(config: IOptions): Promise<Etcd3> {
    this.logger.info('[midway:etcd] init %s', config.hosts);
    return new Etcd3(config);
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ETCDService extends Etcd3 {
  // empty
}

delegateTargetAllPrototypeMethod(ETCDService, Etcd3);
