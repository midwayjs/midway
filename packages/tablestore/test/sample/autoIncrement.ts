import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { PrimaryKeyOption, PrimaryKeyType, TableStoreService, Condition, ReturnType, RowExistenceExpectation, PK_AUTO_INCR } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  const tableName = 'autoIncTable';
  const pk1 = 'stringPK';
  const pk2 = 'autoIncPK';

  //创建一个带自增主键的表
  await tableStoreService.createTable({
    tableMeta: {
      tableName: tableName,
      primaryKey: [
        {
          name: pk1,
          type: PrimaryKeyType.STRING
        },
        {
          name: pk2,
          type: PrimaryKeyType.INTEGER,
          option: PrimaryKeyOption.AUTO_INCREMENT // 自增列，指定 option 为AUTO_INCREMENT
        },
      ]
    },
    reservedThroughput: {
      capacityUnit: {
        read: 0,
        write: 0
      }
    },
    tableOptions: {
      timeToLive: -1,// 数据的过期时间, 单位秒, -1代表永不过期. 假如设置过期时间为一年, 即为 365 * 24 * 3600.
      maxVersions: 1// 保存的最大版本数, 设置为1即代表每列上最多保存一个版本(保存最新的版本).
    },
  });

  //插入数据，自增列的值指定为：TableStore.PK_AUTO_INCR 即可
  await tableStoreService.putRow({
    tableName: tableName,
    condition: new Condition(RowExistenceExpectation.IGNORE, null),
    primaryKey: [
      {stringPK: 'pk1'},
      {autoIncPK: PK_AUTO_INCR}
    ],
    attributeColumns: [
      {'col1': 'col1val'}
    ],
    returnContent: {returnType: ReturnType.Primarykey}
  });


})();
