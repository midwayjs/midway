import * as Consul from 'consul';
import { IServiceBalancer, IConsulBalancer } from '../interface';

abstract class Balancer implements IServiceBalancer {
  protected constructor(protected consul: Consul.Consul) {
    //
  }

  async select(serviceName: string, passingOnly = true): Promise<any | never> {
    // throw new Error('not implemented');
  }

  async loadServices(serviceName: string, passingOnly = true): Promise<any[]> {
    if (passingOnly) return await this.loadPassing(serviceName);
    return await this.loadAll(serviceName);
  }

  private async loadAll(serviceName: string): Promise<any[]> {
    return (await this.consul.catalog.service.nodes(serviceName)) as any[];
  }

  private async loadPassing(serviceName: string): Promise<any[]> {
    const passingIds = [];
    const checks = (await this.consul.health.checks(serviceName)) as any[];

    // 健康检查通过的
    checks.forEach(check => {
      if (check.Status === 'passing') {
        passingIds.push(check.ServiceID);
      }
    });

    const instances = await this.loadAll(serviceName);
    return instances.filter(item => passingIds.includes(item.ServiceID));
  }
}

class RandomBalancer extends Balancer {
  constructor(consul: Consul.Consul) {
    super(consul);
  }

  async select(serviceName: string, passingOnly = true): Promise<any | never> {
    let instances = await this.loadServices(serviceName, passingOnly);
    if (instances.length > 0) {
      instances = this.shuffle(instances);
      return instances[Math.floor(Math.random() * instances.length)];
    }

    throw new Error('no available instance named ' + serviceName);
  }

  /**
   * shuff by fisher-yates
   */
  shuffle(instances: Array<any>): Array<any> {
    const result = [];

    for (let i = 0; i < instances.length; i++) {
      const j = Math.floor(Math.random() * (i + 1));
      if (j !== i) {
        result[i] = result[j];
      }
      result[j] = instances[i];
    }

    return result;
  }
}

export class ConsulBalancer implements IConsulBalancer {
  constructor(private consul: Consul.Consul) {
    //
  }

  getServiceBalancer(strategy?: string): IServiceBalancer {
    switch (strategy) {
      case 'random':
        return new RandomBalancer(this.consul);
    }

    throw new Error('invalid strategy balancer');
  }
}
