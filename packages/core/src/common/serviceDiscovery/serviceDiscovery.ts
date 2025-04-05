import { Destroy } from '../../decorator';
import {
  IServiceDiscovery,
  ServiceDiscoveryOptions,
  ILoadBalancer,
  IServiceDiscoveryHealthCheck,
  ServiceDiscoveryBaseInstance,
  DefaultInstanceMetadata,
} from '../../interface';
import { LoadBalancerFactory } from './loadBalancer';
import { LoadBalancerType } from '../../interface';
import { NetworkUtils } from '../../util/network';
import { ServiceDiscoveryHealthCheckFactory } from './healthCheck';

export abstract class ServiceDiscoveryAdapter<
  Client,
  ServiceInstance extends ServiceDiscoveryBaseInstance
> implements IServiceDiscovery<Client, ServiceInstance>
{
  protected options: ServiceDiscoveryOptions<ServiceInstance> = {};
  protected watchers: Map<string, Set<(instances: ServiceInstance[]) => void>> =
    new Map();
  protected loadBalancer: ILoadBalancer<ServiceInstance>;
  protected instance?: ServiceInstance;
  protected client: Client;
  abstract protocol: string;
  protected healthCheck?: IServiceDiscoveryHealthCheck<ServiceInstance>;
  constructor(
    client: Client,
    serviceDiscoveryOptions: ServiceDiscoveryOptions<ServiceInstance>
  ) {
    this.client = client;
    this.options = serviceDiscoveryOptions;
    // set default load balancer
    if (this.options.loadBalancer) {
      this.setLoadBalancer(this.options.loadBalancer);
    } else {
      this.setLoadBalancer(LoadBalancerType.ROUND_ROBIN);
    }

    // set default health check
    if (this.options.healthCheckType) {
      this.healthCheck = ServiceDiscoveryHealthCheckFactory.create(
        this.options.healthCheckType,
        this.options.healthCheckOptions
      );
    }
  }

  public getDefaultInstanceMeta(): DefaultInstanceMetadata {
    // id 再加一个 6 位字母或者数字随机串
    const random = Math.random().toString(36).substring(2, 8);
    return {
      id: `${NetworkUtils.getHostname()}-${process.pid}-${random}`,
      serviceName: `${this.protocol}-${NetworkUtils.getHostname()}`,
      host: NetworkUtils.getIpv4Address(),
      port: 0,
      protocol: this.protocol,
      metadata: {},
      status: 'UP',
    };
  }

  /**
   * 获取服务列表
   */
  abstract getInstances(serviceName: string): Promise<ServiceInstance[]>;

  /**
   * 获取所有服务名称
   */
  abstract getServiceNames(): Promise<string[]>;

  /**
   * 获取服务实例（带负载均衡）
   */
  async getInstance(serviceName: string): Promise<ServiceInstance> {
    const instances = await this.getInstances(serviceName);
    return this.loadBalancer.select(instances);
  }

  /**
   * 设置负载均衡策略
   */
  setLoadBalancer(
    type: LoadBalancerType | ILoadBalancer<ServiceInstance>
  ): void {
    if (typeof type === 'string') {
      this.loadBalancer = LoadBalancerFactory.create(type);
    } else {
      this.loadBalancer = type as ILoadBalancer<ServiceInstance>;
    }
  }

  /**
   * 监听服务变更
   */
  watch(
    serviceName: string,
    callback: (instances: ServiceInstance[]) => void
  ): void {
    if (!this.watchers.has(serviceName)) {
      this.watchers.set(serviceName, new Set());
    }
    this.watchers.get(serviceName)?.add(callback);
  }

  /**
   * 移除服务监听
   */
  unwatch(
    serviceName: string,
    callback: (instances: ServiceInstance[]) => void
  ): void {
    this.watchers.get(serviceName)?.delete(callback);
  }

  /**
   * 通知服务变更
   */
  protected notifyWatchers(
    serviceName: string,
    instances: ServiceInstance[]
  ): void {
    this.watchers.get(serviceName)?.forEach(callback => callback(instances));
  }

  /**
   * 停止服务发现
   */
  stop(): Promise<void> {
    this.watchers.clear();
    if (this.instance) {
      return this.deregister(this.instance);
    }
  }

  /**
   * 注册服务实例
   */
  abstract register(instance?: ServiceInstance): Promise<void>;

  /**
   * 注销服务实例
   */
  abstract deregister(instance?: ServiceInstance): Promise<void>;

  /**
   * 更新服务实例状态
   */
  abstract updateStatus(
    instance: ServiceInstance,
    status: 'UP' | 'DOWN'
  ): Promise<void>;

  /**
   * 更新服务实例元数据
   */
  abstract updateMetadata(
    instance: ServiceInstance,
    metadata: Record<string, any>
  ): Promise<void>;
}

/**
 * 服务发现抽象类
 */
export abstract class ServiceDiscovery<
  Client,
  ServiceInstance extends ServiceDiscoveryBaseInstance
> implements IServiceDiscovery<Client, ServiceInstance>
{
  private adapters = new Map<
    string,
    ServiceDiscoveryAdapter<Client, ServiceInstance>
  >();
  protected defaultAdapter: ServiceDiscoveryAdapter<Client, ServiceInstance>;

  abstract init(
    options?: ServiceDiscoveryOptions<ServiceInstance>
  ): Promise<void>;

  register(instance?: ServiceInstance): Promise<void> {
    return this.defaultAdapter.register(instance);
  }

  deregister(instance?: ServiceInstance): Promise<void> {
    return this.defaultAdapter.deregister(instance);
  }

  getInstances(serviceName: string): Promise<ServiceInstance[]> {
    return this.defaultAdapter.getInstances(serviceName);
  }

  getServiceNames(): Promise<string[]> {
    return this.defaultAdapter.getServiceNames();
  }

  watch(
    serviceName: string,
    callback: (instances: ServiceInstance[]) => void
  ): void {
    this.defaultAdapter.watch(serviceName, callback);
  }

  @Destroy()
  stop(): Promise<any> {
    return Promise.all(
      Array.from(this.adapters.values()).map(adapter => adapter.stop())
    );
  }
}
