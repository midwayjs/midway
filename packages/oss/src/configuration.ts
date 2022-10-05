import { Configuration } from '@midwayjs/core';
import { OSSServiceFactory } from './manager';

@Configuration({
  namespace: 'oss',
  importConfigs: [
    {
      default: {
        oss: {
          default: {
            timeout: '60s',
          },
        },
      },
    },
  ],
})
export class OSSConfiguration {
  async onReady(container) {
    await container.getAsync(OSSServiceFactory);
  }
}
