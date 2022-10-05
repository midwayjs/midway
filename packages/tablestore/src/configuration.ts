import { Configuration } from '@midwayjs/core';
import { TableStoreServiceFactory } from './manager';

@Configuration({
  namespace: 'tableStore',
})
export class TableStoreConfiguration {
  async onReady(container) {
    await container.getAsync(TableStoreServiceFactory);
  }
}
