import { Configuration } from '@midwayjs/decorator';
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
export class RedisConfiguration {
  async onReady(container) {
    await container.getAsync(RedisServiceFactory);
  }

  async onStop(container): Promise<void> {
    const factory = await container.getAsync(RedisServiceFactory);
    await factory.stop();
  }
}
