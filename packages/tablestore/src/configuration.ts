import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';
import { TableStoreServiceFactory } from './manager';

@Configuration({
  namespace: 'tableStore',
  importConfigs: [join(__dirname, './config.default')],
})
export class TableStoreConfiguration {
  async onReady(container) {
    await container.getAsync(TableStoreServiceFactory);
  }
}
