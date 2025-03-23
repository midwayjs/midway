import { Etcd3 } from 'etcd3';
import { ServiceDiscovery, ServiceInstance, ServiceDiscoveryOptions, Singleton, Inject, Init, ServiceDiscoveryAdapter } from '@midwayjs/core';
import { ETCDServiceFactory } from '../manager';
import { EtcdServiceDiscoveryOptions } from '../interface';

export class EtcdServiceDiscoverAdapter extends ServiceDiscoveryAdapter<Etcd3> {
  private namespace: string;
  private leaseId?: number;
  private renewTimer?: NodeJS.Timeout;
  private readonly ttl: number;
  private readonly renewInterval: number;

  constructor(client: Etcd3, serviceDiscoveryOptions: EtcdServiceDiscoveryOptions) {
    super(client, serviceDiscoveryOptions);
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

  private async createLease(ttl: number = 30): Promise<number> {
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

  async register(instance: ServiceInstance): Promise<void> {
    const key = this.getInstanceKey(instance.serviceName, instance.id);
    const value = JSON.stringify(instance);
    
    // 创建租约
    this.leaseId = await this.createLease(this.ttl);
    
    // 注册服务实例
    await this.client
      .put(key)
      .value(value)
      .lease(this.leaseId)
      .exec();

    // 启动自动续约
    this.startRenewTimer();
  }

  async deregister(instance: ServiceInstance): Promise<void> {
    const key = this.getInstanceKey(instance.serviceName, instance.id);
    await this.client.delete().key(key).exec();
  }

  async updateStatus(instance: ServiceInstance, status: 'UP' | 'DOWN'): Promise<void> {
    const updatedInstance = { ...instance, status };
    const key = this.getInstanceKey(instance.serviceName, instance.id);
    const value = JSON.stringify(updatedInstance);
    
    await this.client
      .put(key)
      .value(value)
      .lease(this.leaseId)
      .exec();
  }

  async updateMetadata(instance: ServiceInstance, metadata: Record<string, any>): Promise<void> {
    const updatedInstance = { ...instance, metadata };
    const key = this.getInstanceKey(instance.serviceName, instance.id);
    const value = JSON.stringify(updatedInstance);
    
    await this.client
      .put(key)
      .value(value)
      .lease(this.leaseId)
      .exec();
  }

  async getInstances(serviceName: string): Promise<ServiceInstance[]> {
    const key = this.getServiceKey(serviceName);
    const response = await this.client.getAll().prefix(key).exec();
    
    return response.kvs.map(kv => {
      try {
        return JSON.parse(kv.value.toString());
      } catch (error) {
        console.error('Failed to parse service instance:', error);
        return null;
      }
    }).filter(Boolean) as ServiceInstance[];
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

  watch(serviceName: string, callback: (instances: ServiceInstance[]) => void): void {
    super.watch(serviceName, callback);
    
    const key = this.getServiceKey(serviceName);
    this.client.watch()
      .prefix(key)
      .create()
      .then(watcher => {
        watcher.on('put', async () => {
          const instances = await this.getInstances(serviceName);
          this.notifyWatchers(serviceName, instances);
        });
        
        watcher.on('delete', async () => {
          const instances = await this.getInstances(serviceName);
          this.notifyWatchers(serviceName, instances);
        });
      });
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
}

@Singleton()
export class EtcdServiceDiscovery extends ServiceDiscovery<Etcd3> {

  @Inject()
  private etcdServiceFactory: ETCDServiceFactory;

  @Init()
  async init(serviceDiscoveryOptions: ServiceDiscoveryOptions = {}) {
    this.defaultAdapter = new EtcdServiceDiscoverAdapter(this.etcdServiceFactory.get(this.etcdServiceFactory.getDefaultClientName() || 'default'), serviceDiscoveryOptions);
  }
}
