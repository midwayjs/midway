import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { TableStoreService, Condition, Long, RowExistenceExpectation, ReturnType } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  await tableStoreService.updateRow({
    tableName: "orderHistory",
    condition: new Condition(RowExistenceExpectation.EXPECT_EXIST, null),
    primaryKey: [{ 'order_id': "order_id_001" }],
    updateOfAttributeColumns: [
      { 'INCREMENT': [{ 'increment': Long.fromNumber(1)}] }
    ],
    returnContent: {
      returnColumns: ["increment"],
      returnType: ReturnType.AfterModify
    }
  });

  await tableStoreService.batchWriteRow({
    tables: [
      {
        tableName: 'orderHistory',
        rows: [
          {
            type: 'UPDATE',
            condition: new Condition(RowExistenceExpectation.EXPECT_EXIST, null),
            primaryKey: [{ 'order_id': "order_id_001" }],
            attributeColumns: [{ 'INCREMENT': [{ 'increment': Long.fromNumber(1)}] }],
            returnContent: {
              returnColumns: ["increment"],
              returnType: ReturnType.AfterModify
            }
          }
        ]
      },
    ],
  });

})();
