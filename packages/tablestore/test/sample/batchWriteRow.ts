import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { Long, TableStoreService, Condition, RowExistenceExpectation, ReturnType } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  await tableStoreService.batchWriteRow({
    tables: [
      {
        tableName: 'sampleTable',
        rows: [
          {
            type: 'UPDATE',
            condition: new Condition(RowExistenceExpectation.IGNORE, null),
            primaryKey: [{ 'gid': Long.fromNumber(8) }, { 'uid': Long.fromNumber(80) }],
            attributeColumns: [{ 'PUT': [{ 'attrCol1': 'test3' }, { 'attrCol2': 'test4' }] }],
            returnContent: { returnType: 1 }
          },
          {
            type: 'PUT',
            condition: new Condition(RowExistenceExpectation.IGNORE, null),
            primaryKey: [{ 'gid': Long.fromNumber(8) }, { 'uid': Long.fromNumber(81) }],
            attributeColumns: [{ 'attrCol1': 'test1' }, { 'attrCol2': 'test2' }],
            returnContent: { returnType: ReturnType.Primarykey }
          }
        ]
      }
    ],
  });

})();
