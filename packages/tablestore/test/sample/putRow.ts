import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { TableStoreService, Condition, RowExistenceExpectation, Long, ReturnType } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  const currentTimeStamp = Date.now();

  await tableStoreService.putRow({
    tableName: "sampleTable",
    //不管此行是否已经存在，都会插入新数据，如果之前有会被覆盖。condition的详细使用说明，请参考conditionUpdateRow.js
    condition: new Condition(RowExistenceExpectation.IGNORE, null),
    primaryKey: [{ 'gid': Long.fromNumber(20013) }, { 'uid': Long.fromNumber(20013) }],
    attributeColumns: [
      { 'col1': '表格存储' },
      //客户端可以自己指定版本号（时间戳）
      { 'col2': '2', 'timestamp': currentTimeStamp },
      { 'col3': 3.1 },
      { 'col4': -0.32 },
      { 'col5': Long.fromNumber(123456789) }
    ],
    returnContent: { returnType: ReturnType.Primarykey }
  });

})();
