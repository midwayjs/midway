import {
  ServiceDiscovery,
  ServiceInstance,
  ServiceDiscoveryOptions,
  Singleton,
  Inject,
  Init,
  ServiceDiscoveryAdapter,
  Config,
  NetworkUtils,
} from '@midwayjs/core';
import { ConsulServiceFactory } from '../manager';
import { ConsulServiceDiscoveryOptions, ConsulClient } from '../interface';


export class ConsulServiceDiscoverAdapter extends ServiceDiscoveryAdapter<
  ConsulClient
> {
  private readonly check: ConsulServiceDiscoveryOptions['check'];

  constructor(
    consul: ConsulClient,
    serviceDiscoveryOptions: ConsulServiceDiscoveryOptions
  ) {
    super(consul, serviceDiscoveryOptions);
    this.check = serviceDiscoveryOptions.check;
  }

  async register(instance: ServiceInstance): Promise<void> {
    const serviceId = `${instance.serviceName}:${instance.id}`;
    const serviceDef = {
      id: serviceId,
      name: instance.serviceName,
      address: instance.host,
      port: instance.port,
      tags: instance.metadata?.tags || [],
      meta: instance.metadata || {},
      check: {
        name: `service:${serviceId}`,
        tcp: `${instance.host}:${instance.port}`,
        interval: '3s',
        timeout: '1s',
        ...this.check,
      },
    };

    await this.client.agent.service.register(serviceDef);
    this.instance = instance;
  }

  async deregister(instance: ServiceInstance): Promise<void> {
    const serviceId = `${instance.serviceName}:${instance.id}`;
    await this.client.agent.service.deregister(serviceId);
  }

  async updateStatus(
    instance: ServiceInstance,
    status: 'UP' | 'DOWN'
  ): Promise<void> {
    const serviceId = `${instance.serviceName}:${instance.id}`;
    const checkId = `service:${serviceId}`;

    if (status === 'UP') {
      await this.client.agent.check.pass(checkId);
    } else {
      await this.client.agent.check.fail(checkId);
    }
  }

  async updateMetadata(
    instance: ServiceInstance,
    metadata: Record<string, any>
  ): Promise<void> {
    const serviceId = `${instance.serviceName}:${instance.id}`;
    const serviceDef = {
      id: serviceId,
      name: instance.serviceName,
      address: instance.host,
      port: instance.port,
      tags: metadata.tags || [],
      meta: metadata,
    };

    await this.client.agent.service.register(serviceDef);
  }

  async getInstances(serviceName: string): Promise<ServiceInstance[]> {
    const services = await this.client.catalog.service.nodes(serviceName);
    const checks = await this.client.health.checks(serviceName);

    // 获取所有通过健康检查的服务 ID
    const passingServiceIds = new Set(
      checks
        .filter(check => check.Status === 'passing')
        .map(check => check.ServiceID)
    );

    return services
      .filter(service => passingServiceIds.has(service.ServiceID))
      .map(service => ({
        id: service.ServiceID.split(':')[1],
        serviceName: service.ServiceName,
        host: service.ServiceAddress || service.Address,
        port: service.ServicePort,
        metadata: {
          ...service.ServiceMeta,
          tags: service.ServiceTags,
        },
        status: 'UP',
      }));
  }

  async getServiceNames(): Promise<string[]> {
    const services = await this.client.catalog.services();
    return Object.keys(services);
  }

  watch(
    serviceName: string,
    callback: (instances: ServiceInstance[]) => void
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
export class ConsulServiceDiscovery extends ServiceDiscovery<ConsulClient> {
  public protocol = 'consul';

  @Inject()
  private consulServiceFactory: ConsulServiceFactory;

  @Config('consul.serviceDiscovery')
  consulServiceDiscoveryOptions: ConsulServiceDiscoveryOptions;

  @Init()
  async init(serviceDiscoveryOptions?: ServiceDiscoveryOptions) {

    const serviceDiscoveryOption = serviceDiscoveryOptions ?? this.consulServiceDiscoveryOptions;

    if (serviceDiscoveryOption) {
      this.defaultAdapter = new ConsulServiceDiscoverAdapter(
        this.consulServiceFactory.get(
          this.consulServiceFactory.getDefaultClientName() || 'default'
        ),
        serviceDiscoveryOption
      );
    }
  }

  serviceInstanceTpl(protocol: string): ServiceInstance {
    // id 再加一个 6 位字母或者数字随机串
    const random = Math.random().toString(36).substring(2, 8);
    return {
      id: `${NetworkUtils.getHostname()}-${process.pid}-${random}`,
      serviceName: `${protocol}-${NetworkUtils.getHostname()}`,
      protocol,
      host: NetworkUtils.getIpv4Address(),
      host_v6: NetworkUtils.getIpv6Address(),
      port: 80,
      port_v6: 80,
      metadata: {},
    };
  }
}
