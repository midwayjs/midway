import { Init, Inject, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { ConsulBalancer } from '../lib/balancer';
import * as Consul from 'consul';
import { IBalancer, IConsulBalancer } from '../interface';

@Provide()
@Scope(ScopeEnum.Singleton)
export class BalancerService implements IConsulBalancer {
  @Inject()
  consul: Consul.Consul;

  private consulBalancer: ConsulBalancer;

  @Init()
  init(): void {
    this.consulBalancer = new ConsulBalancer(this.consul);
  }

  getBalancer(strategy = 'random'): IBalancer {
    return this.consulBalancer.getBalancer(strategy);
  }
}
