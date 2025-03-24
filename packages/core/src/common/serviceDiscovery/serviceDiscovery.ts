import { Destroy } from '../../decorator';
import {
  IServiceDiscovery,
  ServiceDiscoveryOptions,
  ServiceInstance,
  ILoadBalancer,
} from '../../interface';
import { LoadBalancerFactory } from './loadBalancer';
import { LoadBalancerType } from '../../interface';

export abstract class ServiceDiscoveryAdapter<Client>
  implements IServiceDiscovery<Client>
{
  protected options: ServiceDiscoveryOptions = {};
  protected watchers: Map<string, Set<(instances: ServiceInstance[]) => void>> =
    new Map();
  protected loadBalancer: ILoadBalancer;
  protected instance?: ServiceInstance;
  protected client: Client;

  constructor(
    client: Client,
    serviceDiscoveryOptions: ServiceDiscoveryOptions
  ) {
    this.client = client;
    this.options = serviceDiscoveryOptions;
    if (this.options.loadBalancer) {
      this.setLoadBalancer(this.options.loadBalancer);
    } else {
      this.setLoadBalancer(LoadBalancerType.ROUND_ROBIN);
    }
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
  setLoadBalancer(type: LoadBalancerType | ILoadBalancer): void {
    if (typeof type === 'string') {
      this.loadBalancer = LoadBalancerFactory.create(type);
    } else {
      this.loadBalancer = type as ILoadBalancer;
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
  abstract register(instance: ServiceInstance): Promise<void>;

  /**
   * 注销服务实例
   */
  abstract deregister(instance: ServiceInstance): Promise<void>;

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
export abstract class ServiceDiscovery<Client>
  implements IServiceDiscovery<Client>
{
  private adapters = new Map<string, ServiceDiscoveryAdapter<Client>>();
  protected defaultAdapter: ServiceDiscoveryAdapter<Client>;

  abstract init(options?: ServiceDiscoveryOptions): Promise<void>;

  register(instance: ServiceInstance): Promise<void> {
    return this.defaultAdapter.register(instance);
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
