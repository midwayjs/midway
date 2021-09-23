import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { TableStoreService, Long, CompositeCondition, SingleColumnCondition, LogicalOperator, ComparatorType } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  await tableStoreService.getRow({
    tableName: "sampleTable",
    primaryKey: [{ 'gid': Long.fromNumber(20013) }, { 'uid': Long.fromNumber(20013) }],
    maxVersions: 1,   //设置读取最新版本，默认为1
    columnsToGet: ["col1", "col2"],   //设置读取指定的列
  });

  //设置过滤器，当name = john 而且 addr = china 时返回该行
  const condition = new CompositeCondition(LogicalOperator.AND);
  condition.addSubCondition(new SingleColumnCondition('col1', '表格存储', ComparatorType.EQUAL));
  condition.addSubCondition(new SingleColumnCondition('col5', Long.fromNumber(123456789), ComparatorType.EQUAL));

  await tableStoreService.getRow({
    tableName: "sampleTable",
    primaryKey: [{ 'gid': Long.fromNumber(20013) }, { 'uid': Long.fromNumber(20013) }],
    columnFilter: condition
  });

})();
