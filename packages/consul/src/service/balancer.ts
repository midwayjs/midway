import { Init, Inject, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { ConsulBalancer } from '../lib/balancer';
import * as Consul from 'consul';
import { IServiceBalancer, IConsulBalancer } from '../interface';

@Provide()
@Scope(ScopeEnum.Singleton)
export class BalancerService implements IConsulBalancer {
  @Inject('consul:consul')
  consul: Consul.Consul;

  private consulBalancer: ConsulBalancer;

  @Init()
  init(): void {
    this.consulBalancer = new ConsulBalancer(this.consul);
  }

  getServiceBalancer(strategy = 'random'): IServiceBalancer {
    return this.consulBalancer.getServiceBalancer(strategy);
  }
}
