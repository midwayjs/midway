import { Destroy, Init } from '../../decorator';
import {
  IServiceDiscoveryClient,
  ServiceDiscoveryOptions,
  ILoadBalancer,
  DefaultInstanceMetadata,
} from '../../interface';
import { LoadBalancerFactory } from './loadBalancer';
import { LoadBalancerType } from '../../interface';
import { NetworkUtils } from '../../util/network';
import { extend } from '../../util/extend';

export abstract class ServiceDiscoveryClient<
  Client,
  ServiceDiscoveryConfigOptions extends ServiceDiscoveryOptions<QueryServiceInstance>,
  RegisterServiceInstance,
  QueryServiceInstance = RegisterServiceInstance
> implements IServiceDiscoveryClient<QueryServiceInstance>
{
  protected options: ServiceDiscoveryConfigOptions;
  protected instance?: RegisterServiceInstance;
  protected client: Client;
  protected constructor(
    client: Client,
    serviceDiscoveryOptions: ServiceDiscoveryConfigOptions
  ) {
    this.client = client;
    this.options =
      serviceDiscoveryOptions ?? ({} as ServiceDiscoveryConfigOptions);
  }

  private _defaultMeta: DefaultInstanceMetadata;

  get defaultMeta(): DefaultInstanceMetadata {
    if (!this._defaultMeta) {
      this._defaultMeta = this.getDefaultInstanceMeta();
    }
    return this._defaultMeta;
  }

  private getDefaultInstanceMeta(): DefaultInstanceMetadata {
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

  abstract beforeStop(): Promise<void>;

  /**
   * 停止服务发现
   */
  async stop(): Promise<void> {
    await this.beforeStop();
    if (this.instance) {
      return this.deregister();
    }
  }

  /**
   * 注册服务实例
   */
  abstract register(instance: RegisterServiceInstance): Promise<void>;

  /**
   * 注销服务实例
   */
  abstract deregister(): Promise<void>;

  /**
   * 上线服务实例
   */
  abstract online(): Promise<void>;

  /**
   * 下线服务实例
   */
  abstract offline(): Promise<void>;
}

/**
 * 服务发现抽象类
 */
export abstract class ServiceDiscovery<
  Client,
  ServiceDiscoveryConfigOptions extends ServiceDiscoveryOptions<QueryServiceInstance>,
  RegisterServiceInstance,
  QueryServiceInstance = RegisterServiceInstance,
  GetInstanceOptions = RegisterServiceInstance
> {
  protected serviceDiscoveryClientStore: Set<
    ServiceDiscoveryClient<
      Client,
      ServiceDiscoveryConfigOptions,
      RegisterServiceInstance,
      QueryServiceInstance
    >
  > = new Set();

  protected abstract getServiceClient(): Client;

  protected loadBalancer: ILoadBalancer<QueryServiceInstance>;

  @Init()
  async init() {
    // set default load balancer
    if (this.getDefaultServiceDiscoveryOptions().loadBalancer) {
      this.setLoadBalancer(
        this.getDefaultServiceDiscoveryOptions().loadBalancer
      );
    } else {
      this.setLoadBalancer(LoadBalancerType.ROUND_ROBIN);
    }
  }

  public createClient(
    options?: ServiceDiscoveryOptions<QueryServiceInstance>
  ): ServiceDiscoveryClient<
    Client,
    ServiceDiscoveryConfigOptions,
    RegisterServiceInstance,
    QueryServiceInstance
  > {
    const serviceDiscoveryOption = extend(
      {},
      options,
      this.getDefaultServiceDiscoveryOptions()
    ) as ServiceDiscoveryConfigOptions;
    const client = this.createServiceDiscoverClientImpl(serviceDiscoveryOption);

    this.serviceDiscoveryClientStore.add(client);
    return client;
  }

  protected abstract createServiceDiscoverClientImpl(
    options: ServiceDiscoveryOptions<QueryServiceInstance>
  ): ServiceDiscoveryClient<
    Client,
    ServiceDiscoveryConfigOptions,
    RegisterServiceInstance,
    QueryServiceInstance
  >;

  protected abstract getDefaultServiceDiscoveryOptions(): ServiceDiscoveryConfigOptions;

  protected async beforeStop(): Promise<void> {}

  /**
   * 获取可用服务列表
   */
  public abstract getInstances(
    options: GetInstanceOptions
  ): Promise<QueryServiceInstance[]>;

  /**
   * 获取一个可用服务实例（带负载均衡）
   */
  public async getInstance(
    options: GetInstanceOptions
  ): Promise<QueryServiceInstance> {
    const instances = await this.getInstances(options);
    return this.loadBalancer.select(instances);
  }

  /**
   * 设置负载均衡策略
   */
  public setLoadBalancer(
    type: LoadBalancerType | ILoadBalancer<QueryServiceInstance>
  ): void {
    if (typeof type === 'string') {
      this.loadBalancer = LoadBalancerFactory.create(type);
    } else {
      this.loadBalancer = type as ILoadBalancer<QueryServiceInstance>;
    }
  }

  @Destroy()
  protected async destroy() {
    await this.beforeStop();
    for (const client of this.serviceDiscoveryClientStore) {
      await client.stop();
    }
    this.serviceDiscoveryClientStore.clear();
  }
}
