import {
  ServiceDiscovery,
  ServiceDiscoveryAdapter,
  Singleton,
  Inject,
  Init,
  Config,
  MidwayConfigMissingError,
  DataListener,
  ILogger,
  Logger,
} from '@midwayjs/core';
import { RedisServiceFactory } from '../manager';
import {
  RedisServiceDiscoveryOptions,
  RedisInstanceMetadata,
} from '../interface';
import Redis from 'ioredis';

class RedisDataListener extends DataListener<RedisInstanceMetadata[]> {
  private unsubscribe: (() => void) | null = null;
  // 新增：定时刷新 TTL
  private ttlTimeout: NodeJS.Timeout | null = null;
  private instance: RedisInstanceMetadata | null = null;
  private instanceKey: string | null = null;
  private serviceName: string;

  constructor(
    serviceName: string,
    protected readonly client: Redis,
    protected readonly pubsub: Redis,
    protected readonly options: RedisServiceDiscoveryOptions,
    protected readonly logger: ILogger
  ) {
    super();
    this.serviceName = serviceName;
  }

  async init() {
    await super.init();
  }

  async initData() {
    // 1. 用 SCAN 替代 KEYS 获取所有实例 key
    const keys = await this.scanKeys(
      `${this.options.prefix}${this.serviceName}:instance:*`
    );
    return this.fetchInstancesByKeys(keys);
  }

  onData(setData) {
    // 订阅当前 serviceName 的变更消息
    const channel = `service:change:${this.serviceName}`;
    const handler = async (channelName, message) => {
      if (channelName !== channel) return;
      try {
        // 变更时重新拉取全量数据
        const keys = await this.scanKeys(
          `${this.options.prefix}${this.serviceName}:instance:*`
        );
        setData(await this.fetchInstancesByKeys(keys));
      } catch (err) {
        this.logger.error('[midway:redis] Error on service change:', err);
      }
    };
    this.pubsub.subscribe(channel);
    this.pubsub.on('message', handler);

    // 提供取消订阅方法
    this.unsubscribe = () => {
      this.pubsub.off('message', handler);
      this.pubsub.unsubscribe(channel);
    };
  }

  async destroyListener() {
    this.clearTTLRefresh();
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  // 新增：上线时启动 TTL 刷新
  async onlineInstance(instance?: RedisInstanceMetadata) {
    instance = this.instance = instance || this.instance;
    const instanceKey = this.getInstanceKey(instance.serviceName, instance.id);
    // 注册/上线/心跳，status 固定为 UP，带 TTL
    const data = { ...instance, status: 'UP' };
    const ttl = instance.ttl || this.options.ttl || 30;
    await this.client.set(instanceKey, JSON.stringify(data), 'EX', ttl);
    this.startTTLRefresh();
  }

  // 新增：下线时清理 TTL 刷新
  async offlineInstance(instance?: RedisInstanceMetadata) {
    instance = instance || this.instance;
    this.clearTTLRefresh();
    const instanceKey = this.getInstanceKey(instance.serviceName, instance.id);
    await this.client.del(instanceKey);
  }

  /**
   * 生成实例唯一 key
   * 格式: <prefix><serviceName>:instance:<instanceId>
   * 例:   services:order:instance:abc123
   */
  private getInstanceKey(serviceName: string, instanceId: string) {
    return `${this.options.prefix}${serviceName}:instance:${instanceId}`;
  }

  private startTTLRefresh() {
    this.clearTTLRefresh();
    if (!this.instance) return;
    const ttl = this.instance.ttl || this.options.ttl || 30;
    const interval = Math.max(ttl * 500, 1000);
    const refresh = async () => {
      try {
        if (this.instanceKey && this.instance) {
          const data = { ...this.instance, status: 'UP' };
          await this.client.set(
            this.instanceKey,
            JSON.stringify(data),
            'EX',
            ttl
          );
        }
      } catch (err) {
        this.logger.error('[midway:redis] TTL refresh failed:', err);
      }
      this.ttlTimeout = setTimeout(refresh, interval);
    };
    refresh();
  }

  private clearTTLRefresh() {
    if (this.ttlTimeout) {
      clearTimeout(this.ttlTimeout);
      this.ttlTimeout = null;
    }
  }

  /**
   * 使用 SCAN 替代 KEYS，游标式遍历所有匹配的 key
   */
  private async scanKeys(pattern: string, count?: number): Promise<string[]> {
    let cursor = '0';
    let keys: string[] = [];
    const scanCount = count || this.options.scanCount || 100;
    do {
      const [nextCursor, foundKeys] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        scanCount
      );
      cursor = nextCursor;
      keys = keys.concat(foundKeys);
    } while (cursor !== '0');
    return keys;
  }

  /**
   * 批量获取实例 key 并反序列化为对象数组
   */
  private async fetchInstancesByKeys(
    keys: string[]
  ): Promise<RedisInstanceMetadata[]> {
    if (keys.length === 0) return [];
    const values = await this.client.mget(keys);
    return values
      .map(value => {
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      })
      .filter(Boolean) as RedisInstanceMetadata[];
  }
}

export class RedisServiceDiscoverAdapter extends ServiceDiscoveryAdapter<
  Redis,
  RedisServiceDiscoveryOptions,
  RedisInstanceMetadata
> {
  private readonly prefix: string;
  private readonly pubsub: Redis;
  private logger: ILogger;
  // 缓存 listener
  private listenerStore: Map<string, RedisDataListener> = new Map();

  constructor(
    redis: Redis,
    serviceDiscoveryOptions: RedisServiceDiscoveryOptions,
    logger: ILogger
  ) {
    super(redis, serviceDiscoveryOptions);
    this.prefix = serviceDiscoveryOptions.prefix || 'services:';
    this.pubsub = redis.duplicate();
    this.logger = logger;
  }

  // 新增：获取 listener
  private async getListener(serviceName: string): Promise<RedisDataListener> {
    if (!this.listenerStore.has(serviceName)) {
      const options: RedisServiceDiscoveryOptions = {
        ...this.options,
        prefix: this.prefix,
        serviceOptions: this.options.serviceOptions as RedisInstanceMetadata,
      };
      const listener = new RedisDataListener(
        serviceName,
        this.client,
        this.pubsub,
        options,
        this.logger
      );
      this.listenerStore.set(serviceName, listener);
      await listener.init();
    }
    return this.listenerStore.get(serviceName);
  }

  async register(instance?: RedisInstanceMetadata): Promise<void> {
    if (!instance) {
      if (this.instance) {
        instance = this.instance;
      } else {
        const serviceOptions: RedisInstanceMetadata =
          typeof this.options.serviceOptions === 'function'
            ? this.options.serviceOptions(this.getDefaultInstanceMeta())
            : this.options.serviceOptions;
        if (serviceOptions) {
          instance = serviceOptions;
        } else {
          throw new MidwayConfigMissingError(
            'redis.serviceDiscovery.serviceOptions'
          );
        }
        this.instance = instance;
      }
    }

    if (!instance.serviceName) {
      throw new MidwayConfigMissingError(
        'instance.serviceName is required when register service in redis'
      );
    }

    // init listener
    const listener = await this.getListener(instance.serviceName);

    // set status to UP
    await listener.onlineInstance(instance);

    this.logger.info(
      `[midway:redis] register and set status to UP for instance: ${instance.id} and service: ${instance.serviceName}`
    );
    // 发布服务变更消息
    await this.client.publish(
      `service:change:${instance.serviceName}`,
      JSON.stringify({
        type: 'register',
        service: instance.serviceName,
        instance,
      })
    );
  }

  async deregister(instance?: RedisInstanceMetadata): Promise<void> {
    instance = instance ?? this.instance;
    if (instance) {
      const listener = await this.getListener(instance.serviceName);
      // 注销实例
      await listener.offlineInstance();
      // 发布服务变更消息
      await this.client.publish(
        `service:change:${instance.serviceName}`,
        JSON.stringify({
          type: 'deregister',
          service: instance.serviceName,
          instance,
        })
      );
      this.logger.info(
        `[midway:redis] deregister instance: ${instance.id} for service: ${instance.serviceName}`
      );
      this.instance = undefined;
    }
  }

  async online(instance?: RedisInstanceMetadata): Promise<void> {
    await this.register(instance);
  }

  async offline(instance?: RedisInstanceMetadata): Promise<void> {
    await this.deregister(instance);
  }

  // 修改：getInstances 通过 listener 获取
  async getInstances(serviceName: string): Promise<RedisInstanceMetadata[]> {
    // 优先从 listener 的缓存获取数据
    const listener = await this.getListener(serviceName);
    return listener.getData();
  }

  async beforeStop(): Promise<void> {
    await Promise.all(
      Array.from(this.listenerStore.values()).map(listener =>
        listener.destroyListener()
      )
    );
    this.listenerStore.clear();
    // 取消订阅
    await this.pubsub.unsubscribe();
    // 关闭连接
    await this.pubsub.quit();
  }
}

@Singleton()
export class RedisServiceDiscovery extends ServiceDiscovery<
  Redis,
  RedisServiceDiscoveryOptions,
  RedisInstanceMetadata
> {
  @Inject()
  private redisServiceFactory: RedisServiceFactory;

  @Config('redis.serviceDiscovery')
  redisServiceDiscoveryOptions: RedisServiceDiscoveryOptions;

  @Logger()
  coreLogger: ILogger;

  @Init()
  async init(options?: RedisServiceDiscoveryOptions) {
    const serviceDiscoveryOption = options ?? this.redisServiceDiscoveryOptions;

    if (serviceDiscoveryOption) {
      this.defaultAdapter = new RedisServiceDiscoverAdapter(
        this.getServiceDiscoveryClient(),
        serviceDiscoveryOption,
        this.coreLogger
      );
    }
  }

  getServiceDiscoveryClient() {
    return this.redisServiceFactory.get(
      this.redisServiceDiscoveryOptions.serviceDiscoveryClient ||
        this.redisServiceFactory.getDefaultClientName() ||
        'default'
    );
  }
}
