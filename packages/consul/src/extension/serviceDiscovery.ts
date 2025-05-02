import {
  ServiceDiscovery,
  ServiceDiscoveryOptions,
  Singleton,
  Inject,
  Init,
  ServiceDiscoveryAdapter,
  Config,
  MidwayConfigMissingError,
  Logger,
  ILogger,
  DataListener,
  DefaultInstanceMetadata, MidwayParameterError
} from '@midwayjs/core';
import { ConsulServiceFactory } from '../manager';
import {
  ConsulServiceDiscoveryOptions,
  ConsulClient,
  ConsulInstanceMetadata,
  ConsulHealthItem,
  GetHealthServiceOptions
} from '../interface';
import { formatObjectErrorToError, hashServiceOptions, isObjectError } from '../utils';

/**
 * The data listener for consul service discovery
 * @since 4.0.0
 */
class ConsulDataListener extends DataListener<Map<string, ConsulHealthItem>, ConsulHealthItem[]> {
  private watcher: any;

  constructor(protected readonly client: ConsulClient, protected readonly options: GetHealthServiceOptions, protected readonly logger: ILogger) {
    super();
  }

  async init() {
    await super.init();
  }

  private setInnerData(map: Map<string, ConsulHealthItem>, arr: ConsulHealthItem[]) {
    for (const item of arr) {
      map.set(item.Service.ID, item);
    }
  }

  // 初始化数据
  async initData() {
    const services = await this.client.health.service(this.options);
    if (services && isObjectError(services)) {
      throw formatObjectErrorToError(services);
    }
    const map = new Map<string, ConsulHealthItem>();
    this.setInnerData(map, services);
    return map;
  }

  // 更新数据
  onData(setData) {
    this.watcher = this.client.watch({
      method: this.client.health.service,
      options: this.options,
    });

    this.watcher.on('change', (healthItems: ConsulHealthItem[], res) => {
      console.log(healthItems)
      this.setInnerData(this.innerData, healthItems);
      setData(this.innerData);
    });

    this.watcher.on('error', err => {
      this.logger.error('[midway:consul] Error watching service:', err);
    });
  }

  protected override transformData(data: Map<string, ConsulHealthItem>) {
    return Array.from(data.values());
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
export class ConsulServiceDiscoverAdapter extends ServiceDiscoveryAdapter<
  ConsulClient,
  ConsulInstanceMetadata,
  ConsulHealthItem
> {
  private listenerStore: Map<string, ConsulDataListener> = new Map();

  constructor(
    consul: ConsulClient,
    serviceDiscoveryOptions: ConsulServiceDiscoveryOptions,
    protected readonly logger: ILogger
  ) {
    super(consul, serviceDiscoveryOptions);
  }

  async register(instance?: ConsulInstanceMetadata): Promise<void> {
    if (!instance) {
      const serviceOptions: ConsulInstanceMetadata =
        typeof this.options.serviceOptions === 'function'
          ? this.options.serviceOptions(this.getDefaultInstanceMeta())
          : this.options.serviceOptions;

      if (!serviceOptions) {
        // throw error
        throw new MidwayConfigMissingError(
          'consul.serviceDiscovery.serviceOptions'
        );
      }
      instance = this.transformDefaultMetaToConsulInstance(serviceOptions as any);
      this.instance = instance;
    }

    if (!instance.name) {
      throw new MidwayParameterError(
        'instance.name is required when register service'
      );
    }

    const res = await this.client.agent.service.register(instance);
    if (res && isObjectError(res)) {
      throw formatObjectErrorToError(res);
    }
    this.logger.info(`[midway:consul] register instance: ${instance.id} for service: ${instance.name}`);

    // set status to UP
    await this.online(instance);
    this.logger.info(`[midway:consul] set status to UP for instance: ${instance.id} and service: ${instance.name}`);
  }

  async deregister(instance?: ConsulInstanceMetadata): Promise<void> {
    instance = instance ?? this.instance;
    if (instance) {
      const res = await this.client.agent.service.deregister(instance.id);
      if (res && isObjectError(res)) {
        throw formatObjectErrorToError(res);
      }
      this.logger.info(`[midway:consul] deregister instance: ${instance.id} for service: ${instance.id}`);
      this.instance = undefined;
    }
  }

  private transformDefaultMetaToConsulInstance(instance: DefaultInstanceMetadata): ConsulInstanceMetadata {
    return {
      name: instance?.serviceName,
      address: instance?.host,
      meta: instance?.metadata,
      ...instance,
    };
  }

  private async getListener(options: GetHealthServiceOptions): Promise<ConsulDataListener> {
    const cacheKey = hashServiceOptions(options as GetHealthServiceOptions);

    if (!this.listenerStore.has(cacheKey)) {
      const listener = new ConsulDataListener(
        this.client,
        options as GetHealthServiceOptions,
        this.logger
      );
      this.listenerStore.set(cacheKey, listener);
      await listener.init();
    }

    return this.listenerStore.get(cacheKey);
  }

  async getInstances(serviceNameOrOptions: string | GetHealthServiceOptions): Promise<ConsulHealthItem[]> {
    let options = typeof serviceNameOrOptions === 'string' ? { service: serviceNameOrOptions } : serviceNameOrOptions;
    const listener = await this.getListener({
      passing: true,
      ...options,
    } as GetHealthServiceOptions);
    return listener.getData();
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

  async online(instance?: ConsulInstanceMetadata): Promise<void> {
    await this.updateStatus(instance, 'UP');
  }

  async offline(instance?: ConsulInstanceMetadata): Promise<void> {
    await this.updateStatus(instance, 'DOWN');
  }

  async beforeStop() {
    await Promise.all(Array.from(this.listenerStore.values()).map(listener => listener.destroyListener()));
    this.listenerStore.clear();
  }
}

/**
 * The service discovery for consul
 * @since 4.0.0
 */
@Singleton()
export class ConsulServiceDiscovery extends ServiceDiscovery<
  ConsulClient,
  ConsulInstanceMetadata,
  ConsulHealthItem
> {
  @Inject()
  private consulServiceFactory: ConsulServiceFactory;

  @Config('consul.serviceDiscovery')
  consulServiceDiscoveryOptions: ConsulServiceDiscoveryOptions;

  @Logger()
  coreLogger: ILogger;

  @Init()
  async init(options?: ServiceDiscoveryOptions<ConsulHealthItem>) {
    const serviceDiscoveryOption = options ?? this.consulServiceDiscoveryOptions;

    if (serviceDiscoveryOption) {
      this.defaultAdapter = new ConsulServiceDiscoverAdapter(
        this.consulServiceFactory.get(
          serviceDiscoveryOption.serviceDiscoveryClient ||
            this.consulServiceFactory.getDefaultClientName() ||
            'default'
        ),
        serviceDiscoveryOption as ConsulServiceDiscoveryOptions,
        this.coreLogger
      );
    }
  }
}
