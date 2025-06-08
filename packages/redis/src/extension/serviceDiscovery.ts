import {
  ServiceDiscovery,
  ServiceDiscoveryClient,
  Singleton,
  Inject,
  MidwayConfigMissingError,
  DataListener,
  ILogger,
  Logger,
  Init,
  MidwayConfigService,
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

export class RedisServiceDiscoverClient extends ServiceDiscoveryClient<
  Redis,
  RedisServiceDiscoveryOptions,
  RedisInstanceMetadata
> {
  private registeredInstance: RedisInstanceMetadata = null;
  private onlineInstanceData: RedisInstanceMetadata = null;

  constructor(
    protected redis: Redis,
    protected pubsub: Redis,
    protected serviceDiscoveryOptions: RedisServiceDiscoveryOptions,
    protected logger: ILogger,
    protected getListener: (serviceName: string) => Promise<RedisDataListener>
  ) {
    super(redis, serviceDiscoveryOptions);
  }

  async register(instance: RedisInstanceMetadata): Promise<void> {
    this.registeredInstance = instance;
    if (!instance.serviceName) {
      throw new MidwayConfigMissingError(
        'instance.serviceName is required when register service in redis'
      );
    }
    // 注册时默认上线
    await this.online();
  }

  async deregister(): Promise<void> {
    if (this.onlineInstanceData) {
      await this.offline();
    }
    if (this.registeredInstance) {
      // 发布服务变更消息
      await this.client.publish(
        `service:change:${this.registeredInstance.serviceName}`,
        JSON.stringify({
          type: 'deregister',
          service: this.registeredInstance.serviceName,
          instance: this.registeredInstance,
        })
      );
      this.logger.info(
        `[midway:redis] deregister instance: ${this.registeredInstance.id} for service: ${this.registeredInstance.serviceName}`
      );
      this.registeredInstance = null;
    }
  }

  async online(): Promise<void> {
    if (!this.registeredInstance) {
      throw new Error('No instance registered, cannot online.');
    }
    // 已经上线则忽略
    if (this.onlineInstanceData) {
      return;
    }
    const listener = await this.getListener(
      this.registeredInstance.serviceName
    );
    await listener.onlineInstance(this.registeredInstance);
    this.onlineInstanceData = this.registeredInstance;
    // 发布上线消息
    await this.client.publish(
      `service:change:${this.registeredInstance.serviceName}`,
      JSON.stringify({
        type: 'online',
        service: this.registeredInstance.serviceName,
        instance: this.registeredInstance,
      })
    );
  }

  async offline(): Promise<void> {
    // 已经下线则忽略
    if (!this.onlineInstanceData) {
      return;
    }
    const listener = await this.getListener(
      this.onlineInstanceData.serviceName
    );
    await listener.offlineInstance(this.onlineInstanceData);
    // 发布下线消息
    await this.client.publish(
      `service:change:${this.onlineInstanceData.serviceName}`,
      JSON.stringify({
        type: 'offline',
        service: this.onlineInstanceData.serviceName,
        instance: this.onlineInstanceData,
      })
    );
    this.onlineInstanceData = null;
  }

  async beforeStop(): Promise<void> {}
}

@Singleton()
export class RedisServiceDiscovery extends ServiceDiscovery<
  Redis,
  RedisServiceDiscoveryOptions,
  RedisInstanceMetadata,
  RedisInstanceMetadata,
  string
> {
  @Inject()
  private redisServiceFactory: RedisServiceFactory;

  @Inject()
  private configService: MidwayConfigService;

  @Logger()
  private coreLogger: ILogger;

  private redisServiceDiscoveryOptions: RedisServiceDiscoveryOptions;

  private listenerStore: Map<string, RedisDataListener> = new Map();

  private pubsub: Redis;

  @Init()
  async init() {
    this.redisServiceDiscoveryOptions = this.configService.getConfiguration(
      'redis.serviceDiscovery',
      {}
    );
    this.redisServiceDiscoveryOptions.prefix =
      this.redisServiceDiscoveryOptions.prefix || 'services:';
  }

  getServiceClient() {
    return this.redisServiceFactory.get(
      this.redisServiceDiscoveryOptions.serviceDiscoveryClient ||
        this.redisServiceFactory.getDefaultClientName() ||
        'default'
    );
  }

  protected createServiceDiscoverClientImpl(
    options: RedisServiceDiscoveryOptions
  ): RedisServiceDiscoverClient {
    return new RedisServiceDiscoverClient(
      this.getServiceClient(),
      this.pubsub,
      options,
      this.coreLogger,
      serviceName => this.getListener(serviceName)
    );
  }

  protected getDefaultServiceDiscoveryOptions(): RedisServiceDiscoveryOptions {
    return this.redisServiceDiscoveryOptions;
  }

  private async getListener(serviceName: string): Promise<RedisDataListener> {
    if (!this.pubsub) {
      this.pubsub = this.getServiceClient().duplicate();
    }

    if (!this.listenerStore.has(serviceName)) {
      const listener = new RedisDataListener(
        serviceName,
        this.getServiceClient(),
        this.pubsub,
        this.redisServiceDiscoveryOptions,
        this.coreLogger
      );
      this.listenerStore.set(serviceName, listener);
      await listener.init();
    }
    return this.listenerStore.get(serviceName);
  }

  public async getInstances(
    serviceName: string
  ): Promise<RedisInstanceMetadata[]> {
    // 优先从 listener 的缓存获取数据
    const listener = await this.getListener(serviceName);
    return listener.getData();
  }

  async beforeStop() {
    await Promise.all(
      Array.from(this.listenerStore.values()).map(listener =>
        listener.destroyListener()
      )
    );
    this.listenerStore.clear();
    if (this.pubsub) {
      await this.pubsub.unsubscribe();
      await this.pubsub.quit();
      this.pubsub = null;
    }
  }
}
