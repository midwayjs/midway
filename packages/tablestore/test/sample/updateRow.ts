import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { TableStoreService, Condition, RowExistenceExpectation, Long, ReturnType } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  await tableStoreService.updateRow({
    tableName: "sampleTable",
    condition: new Condition(RowExistenceExpectation.IGNORE, null),
    primaryKey: [{ 'gid': Long.fromNumber(9) }, { 'uid': Long.fromNumber(90) }],
    updateOfAttributeColumns: [
      { 'PUT': [{ 'col4': Long.fromNumber(4) }, { 'col5': '5' }, { 'col6': Long.fromNumber(7) }] },
      { 'DELETE': [{ 'col1': Long.fromNumber(1496826473186) }] },
      { 'DELETE_ALL': ['col2'] }
    ],
    returnContent: { returnType: ReturnType.Primarykey }
  });

})();
