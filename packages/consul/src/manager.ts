import {
  Config,
  Init,
  Inject,
  Logger,
  ServiceFactory,
  MidwayCommonError,
  delegateTargetAllPrototypeMethod,
  ServiceFactoryConfigOption,
  Singleton,
  ILogger
} from '@midwayjs/core';
import Consul = require('consul');
import { ConsulClient, ConsulOptions } from './interface';

@Singleton()
export class ConsulServiceFactory extends ServiceFactory<ConsulClient> {
  @Config('consul')
  consulConfig: ServiceFactoryConfigOption<ConsulOptions>;

  @Init()
  async init() {
    await this.initClients(this.consulConfig, {
      concurrent: true,
    });
  }

  @Logger('coreLogger')
  logger: ILogger;

  async createClient(config: ConsulOptions, clientName: string): Promise<InstanceType<typeof Consul>> {
    this.logger.info(`[midway:consul] init %s at %s:%s`, clientName, config.host, config.port);
    return new Consul(config);
  }

  getName() {
    return 'consul';
  }

  async destroyClient(client: InstanceType<typeof Consul>, clientName: string) {
    this.logger.info('[midway:consul] destroy %s', clientName);
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
