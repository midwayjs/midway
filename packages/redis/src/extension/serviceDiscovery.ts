import {
  ServiceDiscovery,
  ServiceDiscoveryAdapter,
  Singleton,
  Inject,
  Init,
  Config,
  MidwayConfigMissingError,
} from '@midwayjs/core';
import { RedisServiceFactory } from '../manager';
import {
  RedisServiceDiscoveryOptions,
  RedisInstanceMetadata,
} from '../interface';
import Redis from 'ioredis';

export class RedisServiceDiscoverAdapter extends ServiceDiscoveryAdapter<
  Redis,
  RedisInstanceMetadata
> {
  private readonly ttl: number;
  private readonly prefix: string;
  private readonly pubsub: Redis;
  public protocol = 'redis';

  constructor(
    redis: Redis,
    serviceDiscoveryOptions: RedisServiceDiscoveryOptions
  ) {
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

  async register(instance: RedisInstanceMetadata): Promise<void> {
    if (!instance) {
      const serviceOptions: RedisInstanceMetadata =
        typeof this.options.serviceOptions === 'function'
          ? this.options.serviceOptions(this.getDefaultInstanceMeta())
          : this.options.serviceOptions;
      if (serviceOptions) {
        serviceOptions.getMetadata = () => {
          return instance.meta;
        };
        instance = serviceOptions;
      } else {
        throw new MidwayConfigMissingError(
          'redis.serviceDiscovery.serviceOptions'
        );
      }
    }

    const key = this.getInstanceKey(instance.serviceName, instance.id);
    const value = JSON.stringify(instance);

    // 使用 Redis 事务确保原子性
    const multi = this.client.multi();
    multi.set(key, value);
    multi.expire(key, instance.ttl || this.ttl);
    await multi.exec();

    // 发布服务变更消息
    await this.pubsub.publish(
      'service:change',
      JSON.stringify({
        type: 'register',
        service: instance.serviceName,
        instance,
      })
    );

    this.instance = instance;
  }

  async deregister(instance?: RedisInstanceMetadata): Promise<void> {
    instance = instance ?? this.instance;
    if (instance) {
      const key = this.getInstanceKey(instance.serviceName, instance.id);
      await this.client.del(key);

      // 发布服务变更消息
      await this.pubsub.publish(
        'service:change',
        JSON.stringify({
          type: 'deregister',
          service: instance.serviceName,
          instance,
        })
      );

      this.instance = undefined;
    }
  }

  async updateStatus(
    instance: RedisInstanceMetadata,
    status: 'UP' | 'DOWN'
  ): Promise<void> {
    const updatedInstance = { ...instance, status };
    const key = this.getInstanceKey(instance.serviceName, instance.id);
    const value = JSON.stringify(updatedInstance);

    await this.client.set(key, value);
    await this.client.expire(key, instance.ttl || this.ttl);

    // 发布服务状态变更消息
    await this.pubsub.publish(
      'service:change',
      JSON.stringify({
        type: 'status',
        service: instance.serviceName,
        instance: updatedInstance,
      })
    );
  }

  async updateMetadata(
    instance: RedisInstanceMetadata,
    metadata: Record<string, any>
  ): Promise<void> {
    const updatedInstance = { ...instance, metadata };
    const key = this.getInstanceKey(instance.serviceName, instance.id);
    const value = JSON.stringify(updatedInstance);

    await this.client.set(key, value);
    await this.client.expire(key, instance.ttl || this.ttl);

    // 发布服务元数据变更消息
    await this.pubsub.publish(
      'service:change',
      JSON.stringify({
        type: 'metadata',
        service: instance.serviceName,
        instance: updatedInstance,
      })
    );
  }

  async getInstances(serviceName: string): Promise<RedisInstanceMetadata[]> {
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
      .filter(Boolean) as RedisInstanceMetadata[];
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

  watch(
    serviceName: string,
    callback: (instances: RedisInstanceMetadata[]) => void
  ): void {
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
export class RedisServiceDiscovery extends ServiceDiscovery<
  Redis,
  RedisInstanceMetadata
> {
  @Inject()
  private redisServiceFactory: RedisServiceFactory;

  @Config('redis.serviceDiscovery')
  redisServiceDiscoveryOptions: RedisServiceDiscoveryOptions;

  @Init()
  async init(options?: RedisServiceDiscoveryOptions) {
    const serviceDiscoveryOption = options ?? this.redisServiceDiscoveryOptions;

    if (serviceDiscoveryOption) {
      this.defaultAdapter = new RedisServiceDiscoverAdapter(
        this.redisServiceFactory.get(
          this.redisServiceFactory.getDefaultClientName() || 'default'
        ),
        serviceDiscoveryOption
      );
    }
  }
}
