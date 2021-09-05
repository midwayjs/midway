import { Configuration } from '@midwayjs/decorator';
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
export class AutoConfiguration {
  async onReady(container) {
    await container.getAsync(COSServiceFactory);
  }
}
