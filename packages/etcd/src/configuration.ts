import { Configuration } from '@midwayjs/core';
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
}
