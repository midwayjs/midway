import {
  ILoadBalancer,
  LoadBalancerType,
  ServiceDiscoveryBaseInstance,
} from '../../interface';

/**
 * 随机负载均衡策略
 */
export class RandomLoadBalance<
  ServiceInstance extends ServiceDiscoveryBaseInstance
> implements ILoadBalancer<ServiceInstance>
{
  select(instances: ServiceInstance[]): ServiceInstance {
    if (!instances.length) {
      throw new Error('No available instances');
    }
    const index = Math.floor(Math.random() * instances.length);
    return instances[index];
  }
}

/**
 * 轮询负载均衡策略
 */
export class RoundRobinLoadBalancer<
  ServiceInstance extends ServiceDiscoveryBaseInstance
> implements ILoadBalancer<ServiceInstance>
{
  private currentIndex = 0;

  select(instances: ServiceInstance[]): ServiceInstance {
    if (!instances.length) {
      throw new Error('No available instances');
    }
    const instance = instances[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % instances.length;
    return instance;
  }
}

/**
 * 权重负载均衡策略
 */
export class WeightedLoadBalancer<
  ServiceInstance extends ServiceDiscoveryBaseInstance
> implements ILoadBalancer<ServiceInstance>
{
  select(instances: ServiceInstance[]): ServiceInstance {
    if (!instances.length) {
      throw new Error('No available instances');
    }

    // 计算总权重
    const totalWeight = instances.reduce((sum, instance) => {
      const weight = instance.getMetadata()?.weight || 1;
      return sum + weight;
    }, 0);

    // 随机选择
    let random = Math.random() * totalWeight;
    for (const instance of instances) {
      const weight = instance.getMetadata()?.weight || 1;
      if (random <= weight) {
        return instance;
      }
      random -= weight;
    }

    // 如果因为浮点数精度问题没有选中，返回最后一个实例
    return instances[instances.length - 1];
  }
}

/**
 * 最小连接数负载均衡策略
 */
export class LeastConnectionLoadBalancer<
  ServiceInstance extends ServiceDiscoveryBaseInstance
> implements ILoadBalancer<ServiceInstance>
{
  select(instances: ServiceInstance[]): ServiceInstance {
    if (!instances.length) {
      throw new Error('No available instances');
    }

    return instances.reduce((min, current) => {
      const minConnections = min.getMetadata()?.connections || 0;
      const currentConnections = current.getMetadata()?.connections || 0;
      return currentConnections < minConnections ? current : min;
    });
  }
}

/**
 * 负载均衡工厂
 */
export class LoadBalancerFactory {
  static create<ServiceInstance extends ServiceDiscoveryBaseInstance>(
    type: LoadBalancerType
  ): ILoadBalancer<ServiceInstance> {
    switch (type) {
      case LoadBalancerType.RANDOM:
        return new RandomLoadBalance();
      case LoadBalancerType.ROUND_ROBIN:
        return new RoundRobinLoadBalancer();
      case LoadBalancerType.WEIGHTED:
        return new WeightedLoadBalancer();
      case LoadBalancerType.LEAST_CONNECTION:
        return new LeastConnectionLoadBalancer();
      case LoadBalancerType.CONSISTENT_HASH:
        throw new Error('Consistent hash load balancer not implemented yet');
      default:
        throw new Error(`Unsupported load balancer type: ${type}`);
    }
  }
}
