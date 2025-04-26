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
} from '@midwayjs/core';
import { ConsulServiceFactory } from '../manager';
import {
  ConsulServiceDiscoveryOptions,
  ConsulClient,
  ConsulInstanceMetadata,
  ConsulHealthItem,
} from '../interface';
import { formatObjectErrorToError, isObjectError } from '../utils';

export class ConsulServiceDiscoverAdapter extends ServiceDiscoveryAdapter<
  ConsulClient,
  ConsulInstanceMetadata
> {
  public protocol = 'consul';
  private watcher;
  private healthStore: Map<string, ConsulHealthItem>;

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
      this.instance = instance;

      if (!this.healthStore) {
        await this.initHealthStore(instance.name);
      }

      // start watch
      this.watcher = this.client.watch({
        method: this.client.health.service,
        options: {
          service: instance.name,
        },
      });

      this.watcher.on('change', (healthItems: ConsulHealthItem[], res) => {
        if (Array.isArray(healthItems) && healthItems.length > 0) {
          for (const healthItem of healthItems) {
            this.healthStore.set(healthItem.Service.ID, healthItem);
          }
        }
        this.logger.info(
          '[midway:consul] get data %j', healthItems
        );
      });

      this.watcher.on('error', err => {
        this.logger.error('[midway:consul] Error watching service:', err);
      });
    }

    const res = await this.client.agent.service.register(instance);
    if (res && isObjectError(res)) {
      throw formatObjectErrorToError(res);
    }
    this.logger.info(`[midway:consul] register instance: ${instance.id} for service: ${instance.name}`);

    // set status to UP
    await this.updateStatus(instance, 'UP');
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

  async updateStatus(
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

  async updateMetadata(
    instance: ConsulInstanceMetadata,
    metadata: Record<string, any>
  ): Promise<void> {
    const res = this.client.agent.service.register(instance);
    if (res && isObjectError(res)) {
      throw formatObjectErrorToError(res);
    }
    this.logger.info(
      `[midway:consul] update metadata for service: ${instance.id}`
    );
  }

  private async initHealthStore(serviceName) {
    this.healthStore = new Map<string, ConsulHealthItem>();
    // init
    const services = await this.client.catalog.service.nodes(serviceName);
    if (services && isObjectError(services)) {
      throw formatObjectErrorToError(services);
    }
    const checks = await this.client.health.checks(serviceName);
    if (checks && isObjectError(checks)) {
      throw formatObjectErrorToError(checks);
    }

    for (const service of services) {
      this.healthStore.set(service.ServiceID, {
        Service: service,
        Checks: null,
        Node: null,
      });
    }

    for (const check of checks) {
      const healthItem = this.healthStore.get(check.ServiceID);
      if (healthItem) {
        healthItem.Checks = check as any;
      }
    }
  }

  async getInstances(serviceName: string): Promise<ConsulInstanceMetadata[]> {
    if (!this.healthStore) {
      await this.initHealthStore(serviceName);
    }

    return Array.from(this.healthStore.values()) as any;
  }

  async getServiceNames(): Promise<string[]> {
    const services = await this.client.catalog.services();
    if (services && isObjectError(services)) {
      throw formatObjectErrorToError(services);
    }
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
        passing: 'UP',
      },
    });

    watcher.on('change', (healthItems: ConsulHealthItem[], res) => {
      for (const healthItem of healthItems) {
        this.healthStore.set(healthItem.Service.ID, healthItem);
      }
    });

    watcher.on('error', err => {
      this.logger.error('[midway:consul] Error watching service:', err);
    });
  }

  async beforeStop() {
    if (this.watcher) {
      this.watcher.end();
    }
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

  @Logger()
  coreLogger: ILogger;

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
        serviceDiscoveryOption as ConsulServiceDiscoveryOptions,
        this.coreLogger
      );
    }
  }
}
