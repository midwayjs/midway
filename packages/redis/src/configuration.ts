import {
  Configuration,
  HealthResult,
  ILifeCycle,
  IMidwayContainer,
} from '@midwayjs/core';
import { RedisServiceFactory } from './manager';

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
  async onReady(container: IMidwayContainer) {
    await container.getAsync(RedisServiceFactory);
  }

  async onStop(container: IMidwayContainer): Promise<void> {
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
