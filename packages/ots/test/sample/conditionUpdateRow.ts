import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { Long, TableStoreService, Condition, RowExistenceExpectation, CompositeCondition, LogicalOperator, SingleColumnCondition, ComparatorType } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  /*
  条件更新使用说明：
  1、期望行是否存在
  RowExistenceExpectation.IGNORE 表示不管此行是否已经存在，都会插入新数据，如果之前有会被覆盖。
  RowExistenceExpectation.EXPECT_EXIST 表示只有此行存在时，才会插入新数据，此时，原有数据也会被覆盖。
  RowExistenceExpectation.EXPECT_NOT_EXIST 表示只有此行不存在时，才会插入数据，否则不执行。
  2、条件组合
  TableStore.SingleColumnCondition 只有一个条件的时候使用
  TableStore.CompositeCondition 有多个条件的时候使用
*/

  //示例：指定条件 期望行存在，并且name=john,addr=china
  const condition = new CompositeCondition(LogicalOperator.AND);
  condition.addSubCondition(new SingleColumnCondition('name', 'john', ComparatorType.EQUAL));
  condition.addSubCondition(new SingleColumnCondition('addr', 'china', ComparatorType.EQUAL));

  await tableStoreService.updateRow({
    tableName: "sampleTable",
    primaryKey: [{ 'gid': Long.fromNumber(20013) }, { 'uid': Long.fromNumber(20013) }],
    updateOfAttributeColumns: [{ 'PUT': [{ 'col1': 'test6' }] }],
    condition: new Condition(RowExistenceExpectation.EXPECT_EXIST, condition),
  });

})();
