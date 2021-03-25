import * as Consul from 'consul';
import { IBalancer, IConsulBalancer } from '../interface';

abstract class Balancer implements IBalancer {
  protected constructor(protected consul: Consul.Consul) {
    //
  }

  async select(serviceName: string, passingOnly = true): Promise<any | never> {
    throw new Error('not implemented');
  }

  async loadServices(serviceName: string, passingOnly = true) {
    if (passingOnly) return this.loadPassing(serviceName);
    return this.loadAll(serviceName);
  }

  private async loadAll(serviceName: string) {
    return (await this.consul.catalog.service.nodes(serviceName)) as Array<any>;
  }

  private async loadPassing(serviceName: string) {
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

class DefaultBalancer extends Balancer {
  constructor(consul: Consul.Consul) {
    super(consul);
  }

  async select(serviceName: string, passingOnly = true): Promise<any | never> {
    const instances = await this.loadServices(serviceName, passingOnly);
    if (instances.length > 0) {
      return instances[0];
    }

    throw new Error('no avaiable instance named ' + serviceName);
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

    throw new Error('no avaiable instance named ' + serviceName);
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

  getBalancer(strategy?: string): IBalancer {
    switch (strategy) {
      case 'default':
        return new DefaultBalancer(this.consul);
      case 'random':
        return new RandomBalancer(this.consul);
    }

    throw new Error('invalid strategy balancer');
  }
}
