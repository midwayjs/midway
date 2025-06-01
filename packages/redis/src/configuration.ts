import {
  Configuration,
  HealthResult,
  ILifeCycle,
  ILogger,
  IMidwayContainer,
  Inject,
  Logger,
  MidwayConfigService,
} from '@midwayjs/core';
import { RedisServiceFactory } from './manager';
import { RedisServiceDiscovery } from './extension/serviceDiscovery';
import { RedisServiceDiscoveryOptions } from './interface';

@Configuration({
  namespace: 'redis',
  importConfigs: [
    {
      default: {
        redis: {},
      },
    },
  ],
})
export class RedisConfiguration implements ILifeCycle {
  @Logger()
  private coreLogger: ILogger;

  @Inject()
  private configService: MidwayConfigService;

  private isSelfRegister = false;

  async onReady(container: IMidwayContainer) {
    await container.getAsync(RedisServiceFactory);
  }

  async onServerReady(container: IMidwayContainer) {
    const config = this.configService.getConfiguration(
      'redis.serviceDiscovery'
    ) as RedisServiceDiscoveryOptions;
    if (config?.selfRegister) {
      this.coreLogger.info(
        '[midway:redis] start to register current node to service discovery'
      );
      const serviceDiscovery = await container.getAsync(RedisServiceDiscovery);
      await serviceDiscovery.register();
      this.isSelfRegister = true;
    }
  }

  async onStop(container: IMidwayContainer): Promise<void> {
    if (this.isSelfRegister) {
      const serviceDiscovery = await container.getAsync(RedisServiceDiscovery);
      await serviceDiscovery.deregister();
    }

    const factory = await container.getAsync(RedisServiceFactory);
    await factory.stop();
  }

  async onHealthCheck(container: IMidwayContainer): Promise<HealthResult> {
    const factory = await container.getAsync(RedisServiceFactory);
    const clients = factory.getClients();

    // find status not ready
    let clientName: any;
    for (const [name, instance] of clients) {
      if (instance.status !== 'ready' && !factory.isLowPriority(name)) {
        clientName = name;
        break;
      }
    }

    return {
      status: !clientName,
      reason: clientName ? `redis client "${clientName}" is not ready` : '',
    };
  }
}
