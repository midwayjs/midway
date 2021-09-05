import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';
import { RedisServiceFactory } from './manager';

@Configuration({
  namespace: 'redis',
  importConfigs: [join(__dirname, './config.default')],
})
export class AutoConfiguration {
  async onReady(container) {
    await container.getAsync(RedisServiceFactory);
  }

  async onStop(container): Promise<void> {
    const factory = await container.getAsync(RedisServiceFactory);
    await factory.stop();
  }
}
