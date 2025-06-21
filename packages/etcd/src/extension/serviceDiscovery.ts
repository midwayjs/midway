import { Etcd3 } from 'etcd3';
import {
  ServiceDiscovery,
  ServiceDiscoveryClient,
  Singleton,
  Inject,
  Logger,
  ILogger,
  Init,
  MidwayConfigService,
} from '@midwayjs/core';
import { ETCDServiceFactory } from '../manager';
import {
  EtcdServiceDiscoveryOptions,
  EtcdInstanceMetadata,
} from '../interface';

class EtcdDataListener {
  private data: EtcdInstanceMetadata[] = [];
  private watcher: any;
  private destroyed = false;

  constructor(private client: Etcd3, private serviceName: string) {}

  async init() {
    await this.refresh();
    this.watcher = await this.client
      .watch()
      .prefix(this.getServiceKey())
      .create();
    this.watcher.on('put', this.refresh.bind(this));
    this.watcher.on('delete', this.refresh.bind(this));
  }

  private getServiceKey() {
    return `${this.serviceName}`.startsWith('/')
      ? `${this.serviceName}`
      : `services/${this.serviceName}`;
  }

  async refresh() {
    if (this.destroyed) return;
    const key = this.getServiceKey();
    const response = await this.client.getAll().prefix(key).exec();
    this.data = response.kvs
      .map(kv => {
        try {
          return JSON.parse(kv.value.toString());
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }

  getData() {
    return this.data;
  }

  async destroy() {
    this.destroyed = true;
    if (this.watcher) {
      await this.watcher.cancel();
      this.watcher = null;
    }
  }
}

export class EtcdServiceDiscoverClient extends ServiceDiscoveryClient<
  Etcd3,
  EtcdServiceDiscoveryOptions,
  EtcdInstanceMetadata
> {
  private lease?: any; // etcd3 的 Lease 实例
  private renewTimer?: NodeJS.Timeout;
  private readonly ttl: number;
  private readonly renewInterval: number;
  private logger: ILogger;

  private registeredInstance: EtcdInstanceMetadata = null;
  private onlineInstanceData: EtcdInstanceMetadata = null;

  constructor(
    client: Etcd3,
    serviceDiscoveryOptions: EtcdServiceDiscoveryOptions,
    logger: ILogger
  ) {
    super(client, serviceDiscoveryOptions);
    this.ttl = serviceDiscoveryOptions.ttl || 30;
    this.renewInterval = Math.floor(this.ttl / 3) * 1000;
    this.logger = logger;
  }

  private getServiceKey(serviceName: string): string {
    const ns = this.options.namespace || 'services';
    return `${ns}/${serviceName}`;
  }

  private getInstanceKey(serviceName: string, instanceId: string): string {
    return `${this.getServiceKey(serviceName)}/${instanceId}`;
  }

  private async createLease(ttl = 30): Promise<any> {
    const lease = this.client.lease(ttl);
    await lease.grant();
    return lease;
  }

  private async revokeLeaseIfExists() {
    if (this.lease) {
      try {
        await this.lease.revoke();
      } catch (e) {
        this.logger.debug(
          '[etcd][debug] revokeLease error',
          this.lease.id.toString(),
          e
        );
      }
      this.lease = undefined;
    }
  }

  private async renewLease(): Promise<void> {
    if (!this.lease) {
      return;
    }
    try {
      this.logger.debug('[etcd][debug] renewLease', this.lease.id.toString());
      await this.lease.keepaliveOnce();
    } catch (error) {
      this.logger.debug(
        '[etcd][debug] renewLease failed, will revoke and recreate',
        this.lease.id.toString(),
        error
      );
      await this.revokeLeaseIfExists();
      this.lease = await this.createLease(this.ttl);
    }
  }

  private startRenewTimer(): void {
    if (this.renewTimer) {
      clearInterval(this.renewTimer);
    }
    this.renewTimer = setInterval(() => {
      this.renewLease().catch(error => {
        this.logger.error('Error in lease renewal timer:', error);
      });
    }, this.renewInterval);
  }

  async register(instance: EtcdInstanceMetadata): Promise<void> {
    this.registeredInstance = instance;
    // 注册时默认上线
    await this.online();
  }

  async deregister(): Promise<void> {
    if (this.onlineInstanceData) {
      await this.offline();
    }
    if (this.registeredInstance) {
      const key = this.getInstanceKey(
        this.registeredInstance.serviceName,
        this.registeredInstance.id
      );
      await this.client.delete().key(key).exec();
      this.logger.info(
        `[midway:etcd] deregister instance: ${this.registeredInstance.id} for service: ${this.registeredInstance.serviceName}`
      );
      this.registeredInstance = null;
    }
    await this.revokeLeaseIfExists();
  }

  async online(): Promise<void> {
    if (!this.registeredInstance) {
      throw new Error('No instance registered, cannot online.');
    }
    // 已经上线则忽略
    if (this.onlineInstanceData) {
      return;
    }
    const key = this.getInstanceKey(
      this.registeredInstance.serviceName,
      this.registeredInstance.id
    );
    const value = JSON.stringify(this.registeredInstance);
    this.lease = await this.createLease(
      this.registeredInstance.ttl || this.ttl
    );
    await this.lease.put(key).value(value);
    this.logger.info(
      `[midway:etcd] online instance: ${this.registeredInstance.id} for service: ${this.registeredInstance.serviceName}`
    );
    this.startRenewTimer();
    this.onlineInstanceData = this.registeredInstance;
  }

  async offline(): Promise<void> {
    // 已经下线则忽略
    if (!this.onlineInstanceData) {
      return;
    }
    const key = this.getInstanceKey(
      this.onlineInstanceData.serviceName,
      this.onlineInstanceData.id
    );
    await this.client.delete().key(key).exec();
    this.logger.info(
      `[midway:etcd] offline instance: ${this.onlineInstanceData.id} for service: ${this.onlineInstanceData.serviceName}`
    );
    this.onlineInstanceData = null;
    await this.revokeLeaseIfExists();
  }

  async beforeStop(): Promise<void> {
    if (this.renewTimer) {
      clearInterval(this.renewTimer);
      this.renewTimer = undefined;
    }
    if (this.lease) {
      await this.lease.revoke();
    }
  }
}

@Singleton()
export class EtcdServiceDiscovery extends ServiceDiscovery<
  Etcd3,
  EtcdServiceDiscoveryOptions,
  EtcdInstanceMetadata,
  EtcdInstanceMetadata,
  string
> {
  @Inject()
  private etcdServiceFactory: ETCDServiceFactory;

  @Inject()
  private configService: MidwayConfigService;

  private etcdServiceDiscoveryOptions: EtcdServiceDiscoveryOptions;

  @Logger()
  private coreLogger: ILogger;

  private listenerStore: Map<string, EtcdDataListener> = new Map();

  @Init()
  async init() {
    this.etcdServiceDiscoveryOptions = this.configService.getConfiguration(
      'etcd.serviceDiscovery',
      {}
    );
  }

  protected getServiceClient() {
    return this.etcdServiceFactory.get(
      this.etcdServiceDiscoveryOptions.serviceDiscoveryClient ||
        this.etcdServiceFactory.getDefaultClientName() ||
        'default'
    );
  }

  protected createServiceDiscoverClientImpl(
    options: EtcdServiceDiscoveryOptions
  ): EtcdServiceDiscoverClient {
    return new EtcdServiceDiscoverClient(
      this.getServiceClient(),
      options,
      this.coreLogger
    );
  }

  protected getDefaultServiceDiscoveryOptions(): EtcdServiceDiscoveryOptions {
    return this.etcdServiceDiscoveryOptions;
  }

  private async getListener(serviceName: string): Promise<EtcdDataListener> {
    if (!this.listenerStore.has(serviceName)) {
      const listener = new EtcdDataListener(
        this.getServiceClient(),
        serviceName
      );
      await listener.init();
      this.listenerStore.set(serviceName, listener);
    }
    return this.listenerStore.get(serviceName);
  }

  public async getInstances(
    serviceName: string
  ): Promise<EtcdInstanceMetadata[]> {
    const listener = await this.getListener(serviceName);
    return listener.getData();
  }

  async beforeStop() {
    await Promise.all(
      Array.from(this.listenerStore.values()).map(listener =>
        listener.destroy()
      )
    );
    this.listenerStore.clear();
  }
}
