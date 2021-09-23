import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';
import { TableStoreServiceFactory } from './manager';

@Configuration({
  namespace: 'ots',
  importConfigs: [join(__dirname, './config.default')],
})
export class OTSConfiguration {
  async onReady(container) {
    await container.getAsync(TableStoreServiceFactory);
  }
}
