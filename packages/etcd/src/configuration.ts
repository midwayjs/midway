import { Configuration, IMidwayContainer } from '@midwayjs/core';
import { ETCDServiceFactory } from './manager';
import * as defaultConfig from './config.default';

@Configuration({
  namespace: 'etcd',
  importConfigs: [
    {
      default: defaultConfig,
    },
  ],
})
export class ETCDConfiguration {
  async onReady(container) {
    await container.getAsync(ETCDServiceFactory);
  }

  async onStop(container: IMidwayContainer): Promise<void> {
    const factory = await container.getAsync(ETCDServiceFactory);
    await factory.stop();
  }
}
