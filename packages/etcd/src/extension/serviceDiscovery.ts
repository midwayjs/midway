import { Etcd3 } from 'etcd3';
import {
  ServiceDiscovery,
  ServiceDiscoveryAdapter,
  Singleton,
  Inject,
  Init,
  Config,
  MidwayConfigMissingError,
  Logger,
  ILogger,
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

export class EtcdServiceDiscoverAdapter extends ServiceDiscoveryAdapter<
  Etcd3,
  EtcdServiceDiscoveryOptions,
  EtcdInstanceMetadata
> {
  protected client: Etcd3;
  protected options: EtcdServiceDiscoveryOptions;
  protected instance?: EtcdInstanceMetadata;
  private namespace: string;
  private leaseId?: number;
  private renewTimer?: NodeJS.Timeout;
  private readonly ttl: number;
  private readonly renewInterval: number;
  public protocol = 'etcd';
  private listenerStore: Map<string, EtcdDataListener> = new Map();

  constructor(
    client: Etcd3,
    serviceDiscoveryOptions: EtcdServiceDiscoveryOptions,
    logger: ILogger
  ) {
    super(client, serviceDiscoveryOptions);
    this.client = client;
    this.options = serviceDiscoveryOptions;
    this.namespace = serviceDiscoveryOptions.namespace || 'services';
    this.ttl = serviceDiscoveryOptions.ttl || 30;
    // 续约间隔设置为 TTL 的 1/3，确保有足够的容错时间
    this.renewInterval = Math.floor(this.ttl / 3) * 1000;
  }

  private getServiceKey(serviceName: string): string {
    return `${this.namespace}/${serviceName}`;
  }

  private getInstanceKey(serviceName: string, instanceId: string): string {
    return `${this.getServiceKey(serviceName)}/${instanceId}`;
  }

  private async createLease(ttl = 30): Promise<number> {
    const lease = this.client.lease(ttl);
    const leaseId = await lease.grant();
    return Number(leaseId);
  }

  private async renewLease(): Promise<void> {
    if (!this.leaseId) {
      return;
    }

    try {
      const lease = this.client.lease(this.leaseId);
      await lease.keepaliveOnce();
    } catch (error) {
      console.error('Failed to renew lease:', error);
      // 如果续约失败，尝试重新创建租约
      this.leaseId = await this.createLease(this.ttl);
    }
  }

  private startRenewTimer(): void {
    // 清除可能存在的旧定时器
    if (this.renewTimer) {
      clearInterval(this.renewTimer);
    }

    // 启动新的续约定时器
    this.renewTimer = setInterval(() => {
      this.renewLease().catch(error => {
        console.error('Error in lease renewal timer:', error);
      });
    }, this.renewInterval);
  }

  async register(instance: EtcdInstanceMetadata): Promise<void> {
    if (!instance) {
      const serviceOptions: EtcdInstanceMetadata =
        typeof this.options.serviceOptions === 'function'
          ? this.options.serviceOptions(this.getDefaultInstanceMeta())
          : this.options.serviceOptions;
      if (serviceOptions) {
        instance = serviceOptions;
      } else {
        throw new MidwayConfigMissingError(
          'etcd.serviceDiscovery.serviceOptions'
        );
      }
    }

    const key = this.getInstanceKey(instance.serviceName, instance.id);
    const value = JSON.stringify(instance);

    // 创建租约
    this.leaseId = await this.createLease(instance.ttl || this.ttl);

    // 注册服务实例
    await this.client.put(key).value(value).lease(this.leaseId).exec();

    // 启动自动续约
    this.startRenewTimer();

    this.instance = instance;
  }

  async deregister(instance?: EtcdInstanceMetadata): Promise<void> {
    instance = instance ?? this.instance;
    if (instance) {
      const key = this.getInstanceKey(instance.serviceName, instance.id);
      await this.client.delete().key(key).exec();
      this.instance = undefined;
    }
  }

  async updateStatus(
    instance: EtcdInstanceMetadata,
    status: 'UP' | 'DOWN'
  ): Promise<void> {
    const updatedInstance = { ...instance, status };
    const key = this.getInstanceKey(instance.serviceName, instance.id);
    const value = JSON.stringify(updatedInstance);

    await this.client.put(key).value(value).lease(this.leaseId).exec();
  }

  async updateMetadata(
    instance: EtcdInstanceMetadata,
    metadata: Record<string, any>
  ): Promise<void> {
    const updatedInstance = { ...instance, metadata };
    const key = this.getInstanceKey(instance.serviceName, instance.id);
    const value = JSON.stringify(updatedInstance);

    await this.client.put(key).value(value).lease(this.leaseId).exec();
  }

  private async getListener(serviceName: string): Promise<EtcdDataListener> {
    if (!this.listenerStore.has(serviceName)) {
      const listener = new EtcdDataListener(this.client, serviceName);
      await listener.init();
      this.listenerStore.set(serviceName, listener);
    }
    return this.listenerStore.get(serviceName);
  }

  async getInstances(serviceName: string): Promise<EtcdInstanceMetadata[]> {
    const listener = await this.getListener(serviceName);
    return listener.getData();
  }

  async getServiceNames(): Promise<string[]> {
    const key = this.namespace;
    const response = await this.client.getAll().prefix(key).exec();

    const serviceNames = new Set<string>();
    response.kvs.forEach(kv => {
      const parts = kv.key.toString().split('/');
      if (parts.length >= 2) {
        serviceNames.add(parts[1]);
      }
    });

    return Array.from(serviceNames);
  }

  async stop(): Promise<void> {
    // 清除续约定时器
    if (this.renewTimer) {
      clearInterval(this.renewTimer);
      this.renewTimer = undefined;
    }

    // 撤销租约
    if (this.leaseId) {
      await this.client.lease(this.leaseId).revoke();
    }
    await this.client.close();
  }

  async beforeStop(): Promise<void> {
    await Promise.all(
      Array.from(this.listenerStore.values()).map(listener =>
        listener.destroy()
      )
    );
    this.listenerStore.clear();
    // 清除续约定时器
    if (this.renewTimer) {
      clearInterval(this.renewTimer);
      this.renewTimer = undefined;
    }
    // 撤销租约
    if (this.leaseId) {
      await this.client.lease(this.leaseId).revoke();
    }
    await this.client.close();
  }

  async online(instance?: EtcdInstanceMetadata): Promise<void> {
    await this.register(instance);
  }

  async offline(instance?: EtcdInstanceMetadata): Promise<void> {
    await this.deregister(instance);
  }
}

@Singleton()
export class EtcdServiceDiscovery extends ServiceDiscovery<
  Etcd3,
  EtcdServiceDiscoveryOptions,
  EtcdInstanceMetadata
> {
  @Inject()
  private etcdServiceFactory: ETCDServiceFactory;

  @Config('etcd.serviceDiscovery')
  etcdServiceDiscoveryOptions: EtcdServiceDiscoveryOptions;

  @Logger()
  coreLogger: ILogger;

  @Init()
  async init(options?: EtcdServiceDiscoveryOptions) {
    const serviceDiscoveryOption = options ?? this.etcdServiceDiscoveryOptions;
    if (serviceDiscoveryOption) {
      this.defaultAdapter = new EtcdServiceDiscoverAdapter(
        this.getServiceDiscoveryClient(),
        serviceDiscoveryOption,
        this.coreLogger
      );
    }
  }

  getServiceDiscoveryClient() {
    return this.etcdServiceFactory.get(
      this.etcdServiceDiscoveryOptions.serviceDiscoveryClient ||
        this.etcdServiceFactory.getDefaultClientName() ||
        'default'
    );
  }
}
