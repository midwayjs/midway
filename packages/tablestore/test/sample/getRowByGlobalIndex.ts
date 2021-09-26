import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { TableStoreService, Long } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  await tableStoreService.getRow({
    tableName: "index1",
    primaryKey: [ {'pk2': Long.fromNumber(2)}, {'pk1': Long.fromNumber(1)}]
  });

})();
