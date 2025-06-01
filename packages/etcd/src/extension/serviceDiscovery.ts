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
  private readonly namespace: string;
  private lease?: any; // etcd3 的 Lease 实例
  private renewTimer?: NodeJS.Timeout;
  private readonly ttl: number;
  private readonly renewInterval: number;
  public protocol = 'etcd';
  private listenerStore: Map<string, EtcdDataListener> = new Map();
  private logger: ILogger;

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
    this.logger = logger;
  }

  private getServiceKey(serviceName: string): string {
    return `${this.namespace}/${serviceName}`;
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
        console.log(
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
      console.log('[etcd][debug] renewLease', this.lease.id.toString());
      await this.lease.keepaliveOnce();
    } catch (error) {
      console.log(
        '[etcd][debug] renewLease failed, will revoke and recreate',
        this.lease.id.toString(),
        error
      );
      // 续约失败，revoke 旧 lease 并新建
      await this.revokeLeaseIfExists();
      this.lease = await this.createLease(this.ttl);
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
    // 新增：注册前先 revoke 旧 lease
    await this.revokeLeaseIfExists();
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

    this.lease = await this.createLease(instance.ttl || this.ttl);

    // 注册服务实例
    await this.lease.put(key).value(value);

    this.logger.info(
      `[midway:etcd] register instance: ${instance.id} for service: ${instance.serviceName}`
    );

    // 启动自动续约
    this.startRenewTimer();

    this.instance = instance;
  }

  async deregister(instance?: EtcdInstanceMetadata): Promise<void> {
    instance = instance ?? this.instance;
    if (instance) {
      const key = this.getInstanceKey(instance.serviceName, instance.id);
      await this.client.delete().key(key).exec();

      this.logger.info(
        `[midway:etcd] deregister instance: ${instance.id} for service: ${instance.serviceName}`
      );

      this.instance = undefined;
    }
    // 新增：注销后 revoke lease
    await this.revokeLeaseIfExists();
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
    if (this.lease) {
      await this.lease.revoke();
    }
    this.client.close();
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
