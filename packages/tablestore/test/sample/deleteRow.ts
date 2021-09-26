import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { TableStoreService, Condition, RowExistenceExpectation, Long } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  await tableStoreService.deleteRow({
    tableName: "sampleTable",
    condition: new Condition(RowExistenceExpectation.IGNORE, null),
    primaryKey: [{ 'gid': Long.fromNumber(20013) }, { 'uid': Long.fromNumber(20013) }]
  });

})();
