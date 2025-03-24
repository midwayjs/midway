import { ServiceDiscovery, ServiceInstance, ServiceDiscoveryOptions, Singleton, Inject, Init, ServiceDiscoveryAdapter } from '@midwayjs/core';
import { RedisServiceFactory } from '../manager';
import Redis from 'ioredis';

interface RedisServiceDiscoveryOptions extends ServiceDiscoveryOptions {
  /**
   * 服务信息的过期时间（秒）
   */
  ttl?: number;
  /**
   * 服务信息的 key 前缀
   */
  prefix?: string;
}

export class RedisServiceDiscoverAdapter extends ServiceDiscoveryAdapter<Redis> {
  private readonly ttl: number;
  private readonly prefix: string;
  private readonly pubsub: any;

  constructor(redis: InstanceType<typeof Redis>, serviceDiscoveryOptions: RedisServiceDiscoveryOptions) {
    super(redis, serviceDiscoveryOptions);
    this.ttl = serviceDiscoveryOptions.ttl || 30;
    this.prefix = serviceDiscoveryOptions.prefix || 'services:';
    this.pubsub = redis.duplicate();
  }

  private getServiceKey(serviceName: string): string {
    return `${this.prefix}${serviceName}`;
  }

  private getInstanceKey(serviceName: string, instanceId: string): string {
    return `${this.getServiceKey(serviceName)}:${instanceId}`;
  }

  async register(instance: ServiceInstance): Promise<void> {
    const key = this.getInstanceKey(instance.serviceName, instance.id);
    const value = JSON.stringify(instance);
    
    // 使用 Redis 事务确保原子性
    const multi = this.client.multi();
    multi.set(key, value);
    multi.expire(key, this.ttl);
    await multi.exec();

    // 发布服务变更消息
    await this.pubsub.publish('service:change', JSON.stringify({
      type: 'register',
      service: instance.serviceName,
      instance
    }));

    this.instance = instance;
  }

  async deregister(instance: ServiceInstance): Promise<void> {
    const key = this.getInstanceKey(instance.serviceName, instance.id);
    await this.client.del(key);

    // 发布服务变更消息
    await this.pubsub.publish('service:change', JSON.stringify({
      type: 'deregister',
      service: instance.serviceName,
      instance
    }));

    if (this.instance?.id === instance.id) {
      this.instance = undefined;
    }
  }

  async updateStatus(instance: ServiceInstance, status: 'UP' | 'DOWN'): Promise<void> {
    const updatedInstance = { ...instance, status };
    const key = this.getInstanceKey(instance.serviceName, instance.id);
    const value = JSON.stringify(updatedInstance);
    
    await this.client.set(key, value);
    await this.client.expire(key, this.ttl);

    // 发布服务状态变更消息
    await this.pubsub.publish('service:change', JSON.stringify({
      type: 'status',
      service: instance.serviceName,
      instance: updatedInstance
    }));
  }

  async updateMetadata(instance: ServiceInstance, metadata: Record<string, any>): Promise<void> {
    const updatedInstance = { ...instance, metadata };
    const key = this.getInstanceKey(instance.serviceName, instance.id);
    const value = JSON.stringify(updatedInstance);
    
    await this.client.set(key, value);
    await this.client.expire(key, this.ttl);

    // 发布服务元数据变更消息
    await this.pubsub.publish('service:change', JSON.stringify({
      type: 'metadata',
      service: instance.serviceName,
      instance: updatedInstance
    }));
  }

  async getInstances(serviceName: string): Promise<ServiceInstance[]> {
    const pattern = this.getInstanceKey(serviceName, '*');
    const keys = await this.client.keys(pattern);
    
    if (keys.length === 0) {
      return [];
    }

    const values = await this.client.mget(keys);
    return values
      .map(value => {
        try {
          return JSON.parse(value);
        } catch (error) {
          console.error('Failed to parse service instance:', error);
          return null;
        }
      })
      .filter(Boolean) as ServiceInstance[];
  }

  async getServiceNames(): Promise<string[]> {
    const pattern = `${this.prefix}*`;
    const keys = await this.client.keys(pattern);
    
    const serviceNames = new Set<string>();
    keys.forEach(key => {
      const parts = key.split(':');
      if (parts.length >= 2) {
        serviceNames.add(parts[1]);
      }
    });
    
    return Array.from(serviceNames);
  }

  watch(serviceName: string, callback: (instances: ServiceInstance[]) => void): void {
    super.watch(serviceName, callback);

    // 订阅服务变更消息
    this.pubsub.subscribe('service:change');
    this.pubsub.on('message', async (channel, message) => {
      if (channel !== 'service:change') {
        return;
      }

      try {
        const data = JSON.parse(message);
        if (data.service === serviceName) {
          const instances = await this.getInstances(serviceName);
          this.notifyWatchers(serviceName, instances);
        }
      } catch (error) {
        console.error('Error processing service change message:', error);
      }
    });
  }

  async stop(): Promise<void> {
    // 取消订阅
    await this.pubsub.unsubscribe();
    
    // 如果有当前注册的实例，进行注销
    if (this.instance) {
      await this.deregister(this.instance);
    }
  }
}

@Singleton()
export class RedisServiceDiscovery extends ServiceDiscovery<Redis> {
  @Inject()
  private redisServiceFactory: RedisServiceFactory;

  @Init()
  async init(serviceDiscoveryOptions: ServiceDiscoveryOptions = {}) {
    this.defaultAdapter = new RedisServiceDiscoverAdapter(
      this.redisServiceFactory.get(this.redisServiceFactory.getDefaultClientName() || 'default'),
      serviceDiscoveryOptions
    );
  }
} 