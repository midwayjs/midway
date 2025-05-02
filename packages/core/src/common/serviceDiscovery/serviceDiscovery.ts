import { Destroy } from '../../decorator';
import {
  IServiceDiscovery,
  ServiceDiscoveryOptions,
  ILoadBalancer,
  DefaultInstanceMetadata,
} from '../../interface';
import { LoadBalancerFactory } from './loadBalancer';
import { LoadBalancerType } from '../../interface';
import { NetworkUtils } from '../../util/network';

export abstract class ServiceDiscoveryAdapter<
  Client,
  RegisterServiceInstance,
  QueryServiceInstance = RegisterServiceInstance,
> implements IServiceDiscovery<QueryServiceInstance>
{
  protected options: ServiceDiscoveryOptions<QueryServiceInstance> = {};
  protected loadBalancer: ILoadBalancer<QueryServiceInstance>;
  protected instance?: RegisterServiceInstance;
  protected client: Client;
  protected constructor(
    client: Client,
    serviceDiscoveryOptions: ServiceDiscoveryOptions<QueryServiceInstance>
  ) {
    this.client = client;
    this.options = serviceDiscoveryOptions;
    // set default load balancer
    if (this.options.loadBalancer) {
      this.setLoadBalancer(this.options.loadBalancer);
    } else {
      this.setLoadBalancer(LoadBalancerType.ROUND_ROBIN);
    }
  }

  public getDefaultInstanceMeta(): DefaultInstanceMetadata {
    return {
      id: `${NetworkUtils.getHostname()}-${process.pid}`,
      serviceName: `${NetworkUtils.getHostname()}`,
      host: NetworkUtils.getIpv4Address(),
      port: 0,
      metadata: {},
    };
  }

  public getSelfInstance(): RegisterServiceInstance {
    return this.instance;
  }

  /**
   * 获取可用服务列表
   */
  abstract getInstances<getInstanceOptions>(
    serviceNameOrOptions: string | getInstanceOptions
  ): Promise<QueryServiceInstance[]>;

  /**
   * 获取一个可用服务实例（带负载均衡）
   */
  async getInstance<getInstanceOptions>(
    serviceNameOrOptions: string | getInstanceOptions
  ): Promise<QueryServiceInstance> {
    const instances = await this.getInstances(serviceNameOrOptions);
    return this.loadBalancer.select(instances);
  }

  /**
   * 设置负载均衡策略
   */
  setLoadBalancer(
    type: LoadBalancerType | ILoadBalancer<QueryServiceInstance>
  ): void {
    if (typeof type === 'string') {
      this.loadBalancer = LoadBalancerFactory.create(type);
    } else {
      this.loadBalancer = type as ILoadBalancer<QueryServiceInstance>;
    }
  }

  abstract beforeStop(): Promise<void>;

  /**
   * 停止服务发现
   */
  async stop(): Promise<void> {
    await this.beforeStop();
    if (this.instance) {
      return this.deregister(this.instance);
    }
  }

  /**
   * 注册服务实例
   */
  abstract register(instance?: RegisterServiceInstance): Promise<void>;

  /**
   * 注销服务实例
   */
  abstract deregister(instance?: RegisterServiceInstance): Promise<void>;

  /**
   * 上线服务实例
   */
  abstract online(instance?: RegisterServiceInstance): Promise<void>;

  /**
   * 下线服务实例
   */
  abstract offline(instance?: RegisterServiceInstance): Promise<void>;
}

/**
 * 服务发现抽象类
 */
export abstract class ServiceDiscovery<
  Client,
  RegisterServiceInstance,
  QueryServiceInstance = RegisterServiceInstance
> implements IServiceDiscovery<QueryServiceInstance>
{
  protected defaultAdapter: ServiceDiscoveryAdapter<
    Client,
    RegisterServiceInstance,
    QueryServiceInstance
  >;

  abstract init(
    options?: ServiceDiscoveryOptions<QueryServiceInstance>
  ): Promise<void>;

  getAdapter(): ServiceDiscoveryAdapter<Client, RegisterServiceInstance, QueryServiceInstance> {
    return this.defaultAdapter;
  }

  register(): Promise<void> {
    return this.defaultAdapter.register();
  }

  deregister(): Promise<void> {
    return this.defaultAdapter.deregister();
  }

  getInstances<GetInstanceOptions>(
    serviceName: string | GetInstanceOptions
  ): Promise<QueryServiceInstance[]> {
    return this.defaultAdapter.getInstances(serviceName);
  }

  getInstance<GetInstanceOptions>(
    serviceName: string | GetInstanceOptions
  ): Promise<QueryServiceInstance> {
    return this.defaultAdapter.getInstance(serviceName);
  }

  online(): Promise<void> {
    return this.defaultAdapter.online(
      this.defaultAdapter.getSelfInstance()
    );
  }

  offline(): Promise<void> {
    return this.defaultAdapter.offline(
      this.defaultAdapter.getSelfInstance()
    );
  }

  @Destroy()
  stop(): Promise<any> {
    return this.defaultAdapter.stop();
  }
}
