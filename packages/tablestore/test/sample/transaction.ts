import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { Condition, RowExistenceExpectation, TableStoreService } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  const tableName = "sample"
  const primaryKey = [{
    "id": "a6ef32e3-e058-4b71-b39b-16ad2f6b1afb"
  }]

  await tableStoreService.putRow({
    tableName,
    condition: new Condition(RowExistenceExpectation.IGNORE, null),
    primaryKey,
    attributeColumns: [{
      col: 'inited'
    }]
  });

  // 创建局部事务
  const request = await tableStoreService.startLocalTransaction({
    tableName,
    primaryKey
  });

  const transactionId = request.transactionId;

  // 数据操作
  await tableStoreService.putRow({
    tableName,
    condition: new Condition(RowExistenceExpectation.IGNORE, null),
    primaryKey,
    attributeColumns: [{
      col: 'updated'
    }],
    transactionId
  });

  // 提交事务
  await tableStoreService.commitTransaction({
    transactionId
  });

  // 或丢弃事务
  await tableStoreService.abortTransaction({
    transactionId
  });

})();
