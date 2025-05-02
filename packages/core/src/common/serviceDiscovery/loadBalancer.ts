import {
  ILoadBalancer,
  LoadBalancerType,
} from '../../interface';

/**
 * 随机负载均衡策略
 */
export class RandomLoadBalance<
  ServiceInstance
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
  ServiceInstance
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
 * 负载均衡工厂
 */
export class LoadBalancerFactory {
  static create<ServiceInstance>(
    type: LoadBalancerType,
  ): ILoadBalancer<ServiceInstance> {
    switch (type) {
      case LoadBalancerType.RANDOM:
        return new RandomLoadBalance();
      case LoadBalancerType.ROUND_ROBIN:
        return new RoundRobinLoadBalancer();
      default:
        throw new Error(`Unsupported load balancer type: ${type}`);
    }
  }
}
