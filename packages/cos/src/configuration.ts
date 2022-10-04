import { Configuration } from '@midwayjs/core';
import { COSServiceFactory } from './manager';
import * as defaultConfig from './config.default';

@Configuration({
  namespace: 'cos',
  importConfigs: [
    {
      default: defaultConfig,
    },
  ],
})
export class COSConfiguration {
  async onReady(container) {
    await container.getAsync(COSServiceFactory);
  }
}
