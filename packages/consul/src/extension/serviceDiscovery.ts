import {
  ServiceDiscovery,
  ServiceDiscoveryOptions,
  Singleton,
  Inject,
  Init,
  ServiceDiscoveryAdapter,
  Config,
  MidwayConfigMissingError,
} from '@midwayjs/core';
import { ConsulServiceFactory } from '../manager';
import {
  ConsulServiceDiscoveryOptions,
  ConsulClient,
  ConsulInstanceMetadata,
} from '../interface';

export class ConsulServiceDiscoverAdapter extends ServiceDiscoveryAdapter<
  ConsulClient,
  ConsulInstanceMetadata
> {
  public protocol = 'consul';

  constructor(
    consul: ConsulClient,
    serviceDiscoveryOptions: ConsulServiceDiscoveryOptions
  ) {
    super(consul, serviceDiscoveryOptions);
  }

  async register(instance: ConsulInstanceMetadata): Promise<void> {
    if (!instance) {
      const serviceOptions: ConsulInstanceMetadata =
        typeof this.options.serviceOptions === 'function'
          ? this.options.serviceOptions(this.getDefaultInstanceMeta())
          : this.options.serviceOptions;
      if (serviceOptions) {
        serviceOptions.getMetadata = () => {
          return instance.meta;
        };
        instance = serviceOptions;
      } else {
        // throw error
        throw new MidwayConfigMissingError(
          'consul.serviceDiscovery.serviceOptions'
        );
      }
    }

    await this.client.agent.service.register(instance);
    this.instance = instance;
  }

  async deregister(instance?: ConsulInstanceMetadata): Promise<void> {
    instance = instance ?? this.instance;
    if (instance) {
      await this.client.agent.service.deregister(instance.id);
      this.instance = undefined;
    }
  }

  async updateStatus(
    instance: ConsulInstanceMetadata,
    status: 'UP' | 'DOWN'
  ): Promise<void> {
    const checkId = instance.id;

    if (status === 'UP') {
      await this.client.agent.check.pass(checkId);
    } else {
      await this.client.agent.check.fail(checkId);
    }
  }

  async updateMetadata(
    instance: ConsulInstanceMetadata,
    metadata: Record<string, any>
  ): Promise<void> {
    await this.client.agent.service.register(instance);
  }

  async getInstances(serviceName: string): Promise<ConsulInstanceMetadata[]> {
    const services = await this.client.catalog.service.nodes(serviceName);
    const checks = await this.client.health.checks(serviceName);

    // 获取所有通过健康检查的服务 ID
    const passingServiceIds = new Set(
      checks
        .filter(check => check.Status === 'passing')
        .map(check => check.ServiceID)
    );

    return services.filter(service => passingServiceIds.has(service.ServiceID));
  }

  async getServiceNames(): Promise<string[]> {
    const services = await this.client.catalog.services();
    return Object.keys(services);
  }

  watch(
    serviceName: string,
    callback: (instances: ConsulInstanceMetadata[]) => void
  ): void {
    super.watch(serviceName, callback);

    const watcher = this.client.watch({
      method: this.client.health.service,
      options: {
        service: serviceName,
      },
    });

    watcher.on('change', () => {
      this.getInstances(serviceName)
        .then(instances => this.notifyWatchers(serviceName, instances))
        .catch(error => console.error('Error getting instances:', error));
    });

    watcher.on('error', err => {
      console.error('Error watching service:', err);
    });
  }
}

@Singleton()
export class ConsulServiceDiscovery extends ServiceDiscovery<
  ConsulClient,
  ConsulInstanceMetadata
> {
  public protocol = 'consul';

  @Inject()
  private consulServiceFactory: ConsulServiceFactory;

  @Config('consul.serviceDiscovery')
  consulServiceDiscoveryOptions: ConsulServiceDiscoveryOptions;

  @Init()
  async init(options?: ServiceDiscoveryOptions<ConsulInstanceMetadata>) {
    const serviceDiscoveryOption = options
      ? {
          ...options,
          healthCheckType: 'self' as const,
        }
      : this.consulServiceDiscoveryOptions;

    if (serviceDiscoveryOption) {
      this.defaultAdapter = new ConsulServiceDiscoverAdapter(
        this.consulServiceFactory.get(
          this.consulServiceFactory.getDefaultClientName() || 'default'
        ),
        serviceDiscoveryOption as ConsulServiceDiscoveryOptions
      );
    }
  }
}
