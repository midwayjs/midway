import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { TableStoreService } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  await tableStoreService.dropIndex({
    mainTableName: "sdkGlobalTest",
    indexName: "sdkIndex1"
  });

})();
