import {
  Config,
  Init,
  Inject,
  Logger,
  ServiceFactory,
  MidwayCommonError,
  delegateTargetAllPrototypeMethod,
  Singleton,
} from '@midwayjs/core';
import Consul = require('consul');

@Singleton()
export class ConsulServiceFactory extends ServiceFactory<InstanceType<typeof Consul>> {
  @Config('consul')
  consulConfig;

  @Init()
  async init() {
    await this.initClients(this.consulConfig, {
      concurrent: true,
    });
  }

  @Logger('coreLogger')
  logger;

  async createClient(config: any): Promise<InstanceType<typeof Consul>> {
    this.logger.info('[midway:consul] init %s', config.host);
    return new Consul(config);
  }

  getName() {
    return 'consul';
  }

  async destroyClient(client: InstanceType<typeof Consul>) {
    client.destroy();
  }
}

@Singleton()
export class ConsulService implements InstanceType<typeof Consul> {
  @Inject()
  private serviceFactory: ConsulServiceFactory;

  private instance: InstanceType<typeof Consul>;

  @Init()
  async init() {
    this.instance = this.serviceFactory.get(
      this.serviceFactory.getDefaultClientName?.() || 'default'
    );
    if (!this.instance) {
      throw new MidwayCommonError('consul default instance not found.');
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ConsulService extends InstanceType<typeof Consul> {
  // empty
}

delegateTargetAllPrototypeMethod(ConsulService, Consul); 