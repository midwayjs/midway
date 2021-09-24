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
            // 有 issue 说这里的属性名是 updateOfAttributeColumns，所以我们修改了定义 https://github.com/aliyun/aliyun-tablestore-nodejs-sdk/issues/40
            updateOfAttributeColumns: [
              { 'PUT': [{ 'attrCol1': 'test3' }, { 'attrCol2': 'test4' }] }
            ],
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
