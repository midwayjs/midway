import {
  ServiceDiscovery,
  Singleton,
  Inject,
  ServiceDiscoveryClient,
  Logger,
  ILogger,
  DataListener,
  DefaultInstanceMetadata,
  MidwayParameterError,
  MidwayWebRouterService,
  MidwayApplicationManager,
  Init,
  MidwayConfigService,
} from '@midwayjs/core';
import { ConsulServiceFactory } from '../manager';
import {
  ConsulServiceDiscoveryOptions,
  ConsulClient,
  ConsulInstanceMetadata,
  ConsulHealthItem,
  GetHealthServiceOptions,
} from '../interface';
import {
  formatObjectErrorToError,
  hashServiceOptions,
  isObjectError,
} from '../utils';
import {
  calculateTTL,
  HTTPHealthCheck,
  TCPHealthCheck,
  TTLHeartbeat,
} from './helper';

/**
 * The data listener for consul service discovery
 * @since 4.0.0
 */
class ConsulDataListener extends DataListener<ConsulHealthItem[]> {
  private watcher: any;

  constructor(
    protected readonly client: ConsulClient,
    protected readonly options: GetHealthServiceOptions,
    protected readonly logger: ILogger
  ) {
    super();
  }

  async init() {
    await super.init();
  }

  // 初始化数据
  async initData() {
    const services = await this.client.health.service(this.options);
    if (services && isObjectError(services)) {
      throw formatObjectErrorToError(services);
    }
    return services;
  }

  // 更新数据
  onData(setData) {
    this.watcher = this.client.watch({
      method: this.client.health.service,
      options: this.options as Record<any, any>,
    });

    this.watcher.on('change', (healthItems: ConsulHealthItem[], res) => {
      setData(healthItems);
    });

    this.watcher.on('error', err => {
      this.logger.error('[midway:consul] Error watching service:', err);
    });
  }

  async destroyListener() {
    if (this.watcher) {
      await this.watcher.end();
    }
  }
}

/**
 * The adapter for consul service discovery
 * @since 4.0.0
 */
export class ConsulServiceDiscoverClient extends ServiceDiscoveryClient<
  ConsulClient,
  ConsulServiceDiscoveryOptions,
  ConsulInstanceMetadata,
  ConsulHealthItem
> {
  private ttlHeartbeat?: TTLHeartbeat;
  private httpHealthCheck?: HTTPHealthCheck;
  private tcpHealthCheck?: TCPHealthCheck;

  constructor(
    protected consul: ConsulClient,
    serviceDiscoveryOptions: ConsulServiceDiscoveryOptions,
    protected readonly applicationManager: MidwayApplicationManager,
    protected readonly webRouterService: MidwayWebRouterService,
    protected readonly logger: ILogger
  ) {
    super(consul, serviceDiscoveryOptions);
  }

  async register(instance: ConsulInstanceMetadata): Promise<void> {
    instance = this.transformDefaultMetaToConsulInstance(instance as any);

    this.instance = instance;

    if (!instance.name) {
      throw new MidwayParameterError(
        'instance.name is required when register service in consul'
      );
    }

    const res = await this.client.agent.service.register(instance);
    if (res && isObjectError(res)) {
      throw formatObjectErrorToError(res);
    }
    this.logger.info(
      `[midway:consul] register instance: ${instance.id} for service: ${instance.name}`
    );

    // set status to UP
    await this.online();
    this.logger.info(
      `[midway:consul] set status to UP for instance: ${instance.id} and service: ${instance.name}`
    );

    if (this.options.autoHealthCheck) {
      if (instance['check']?.['ttl']) {
        this.ttlHeartbeat = new TTLHeartbeat({
          consul: this.client,
          checkId: `service:${instance.id}`,
          interval: calculateTTL(instance['check']['ttl']),
        });
        this.ttlHeartbeat.start();
      } else if (instance['check']?.['http']) {
        // 这里要判断下是否启动了 http 服务
        const applications = this.applicationManager.getApplications([
          'egg',
          'koa',
          'express',
        ]);
        if (applications.length !== 0) {
          const url = new URL(instance['check']['http']);
          this.webRouterService.addRouter(
            async _ => {
              return 'success';
            },
            {
              url: url.pathname,
              requestMethod: 'GET',
            }
          );
        } else {
          this.httpHealthCheck = new HTTPHealthCheck(instance['check']['http']);
          this.httpHealthCheck.start();
        }
      } else if (instance['check']?.['tcp']) {
        this.tcpHealthCheck = new TCPHealthCheck(instance['check']['tcp']);
        this.tcpHealthCheck.start();
      }
    }
  }

  async deregister(instance?: ConsulInstanceMetadata): Promise<void> {
    instance = instance ?? this.instance;
    if (instance) {
      const res = await this.client.agent.service.deregister(instance.id);
      if (res && isObjectError(res)) {
        throw formatObjectErrorToError(res);
      }
      this.logger.info(
        `[midway:consul] deregister instance: ${instance.id} for service: ${instance.name}`
      );
      this.instance = undefined;
    }
  }

  private transformDefaultMetaToConsulInstance(
    instance: DefaultInstanceMetadata
  ): ConsulInstanceMetadata {
    return {
      name: instance?.serviceName,
      address: instance?.host,
      meta: instance?.metadata,
      ...instance,
    };
  }

  private async updateStatus(
    instance: ConsulInstanceMetadata,
    status: 'UP' | 'DOWN'
  ): Promise<void> {
    const checkId = `service:${instance.id}`;

    if (status === 'UP') {
      await this.client.agent.check.pass(checkId);
    } else {
      await this.client.agent.check.fail(checkId);
    }
  }

  async online(): Promise<void> {
    await this.updateStatus(this.instance, 'UP');
  }

  async offline(): Promise<void> {
    await this.updateStatus(this.instance, 'DOWN');
  }

  async beforeStop() {
    await this.deregister();

    if (this.ttlHeartbeat) {
      this.ttlHeartbeat.stop();
    }

    if (this.httpHealthCheck) {
      this.httpHealthCheck.stop();
    }

    if (this.tcpHealthCheck) {
      this.tcpHealthCheck.stop();
    }
  }
}

/**
 * The service discovery for consul
 * @since 4.0.0
 */
@Singleton()
export class ConsulServiceDiscovery extends ServiceDiscovery<
  ConsulClient,
  ConsulServiceDiscoveryOptions,
  ConsulInstanceMetadata,
  ConsulHealthItem,
  GetHealthServiceOptions
> {
  @Inject()
  private consulServiceFactory: ConsulServiceFactory;

  private consulServiceDiscoveryOptions: ConsulServiceDiscoveryOptions;

  @Inject()
  private applicationManager: MidwayApplicationManager;

  @Inject()
  private webRouterService: MidwayWebRouterService;

  @Logger()
  private coreLogger: ILogger;

  private defaultServiceClient: ConsulClient;

  private listenerStore: Map<string, ConsulDataListener> = new Map();

  @Inject()
  private configService: MidwayConfigService;

  @Init()
  async init() {
    this.consulServiceDiscoveryOptions = this.configService.getConfiguration(
      'consul.serviceDiscovery',
      {}
    );
  }

  protected getServiceClient() {
    if (!this.defaultServiceClient) {
      this.defaultServiceClient = this.consulServiceFactory.get(
        this.consulServiceDiscoveryOptions.serviceDiscoveryClient ||
          this.consulServiceFactory.getDefaultClientName() ||
          'default'
      );
    }
    return this.defaultServiceClient;
  }

  protected createServiceDiscoverClientImpl(
    options: ConsulServiceDiscoveryOptions
  ): ConsulServiceDiscoverClient {
    return new ConsulServiceDiscoverClient(
      this.getServiceClient(),
      options,
      this.applicationManager,
      this.webRouterService,
      this.coreLogger
    );
  }

  protected getDefaultServiceDiscoveryOptions(): ConsulServiceDiscoveryOptions {
    return this.consulServiceDiscoveryOptions;
  }

  private async getListener(
    options: GetHealthServiceOptions
  ): Promise<ConsulDataListener> {
    const cacheKey = hashServiceOptions(options as GetHealthServiceOptions);

    if (!this.listenerStore.has(cacheKey)) {
      const listener = new ConsulDataListener(
        this.getServiceClient(),
        options as GetHealthServiceOptions,
        this.coreLogger
      );
      this.listenerStore.set(cacheKey, listener);
      await listener.init();
    }

    return this.listenerStore.get(cacheKey);
  }

  public async getInstances(
    options: GetHealthServiceOptions
  ): Promise<ConsulHealthItem[]> {
    const listener = await this.getListener({
      passing: true,
      ...(options as GetHealthServiceOptions),
    });
    return listener.getData();
  }

  async beforeStop() {
    await Promise.all(
      Array.from(this.listenerStore.values()).map(listener =>
        listener.destroyListener()
      )
    );
    this.listenerStore.clear();
  }
}
