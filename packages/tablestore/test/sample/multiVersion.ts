import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { Condition, Long, PrimaryKeyType, RowExistenceExpectation, TableStoreService } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  const tableName = 'maxVersionsTestTable';
  const primaryKey = [{'pk1': 'pk1val'}, {'pk2': 'pk2val'}];

  const getRow = async () => {
    await tableStoreService.getRow({
      tableName: tableName,
      primaryKey: primaryKey,
      timeRange: {
        startTime: '0',
        endTime: new Date().getTime().toString()
      },
      maxVersions: 10
    });
  };

  const batchWriteRow = async () => {
    const params = {
      tables: [{
        tableName: tableName,
        rows: [],
      }],
    };

    for (let i = 0; i < 10; i++) {
      params.tables[0].rows.push({
        type: 'UPDATE',
        condition: new Condition(RowExistenceExpectation.IGNORE, null),
        primaryKey: primaryKey,
        attributeColumns: [{
          'PUT': [{
            'multiVersionCol': '第' + i + '次更新',
            'timestamp': Long.fromNumber(new Date().getTime() + i)
          }]
        }]
      });
    }
    await tableStoreService.batchWriteRow(params);
    await getRow();
  };

  const putRow = async () => {
    const putRowParams = {
      tableName: tableName,
      condition: new Condition(RowExistenceExpectation.IGNORE, null),
      primaryKey: primaryKey,
      attributeColumns: [{'multiVersionCol': '插入原始数据'}]
    };

    await tableStoreService.putRow(putRowParams);

    await batchWriteRow();
  };

  const createTable = async () => {
    await tableStoreService.createTable({
      tableMeta: {
        tableName: tableName,
        primaryKey: [{name: 'pk1', type: PrimaryKeyType.STRING}, {name: 'pk2', type: PrimaryKeyType.STRING}]
      },
      reservedThroughput: {
        capacityUnit: {read: 0, write: 0}
      },
      tableOptions: {
        timeToLive: -1,// 数据的过期时间, 单位秒, -1代表永不过期. 假如设置过期时间为一年, 即为 365 * 24 * 3600.
        maxVersions: 10// 保存的最大版本数, 设置为1即代表每列上最多保存一个版本(保存最新的版本).
      }
    });
    await putRow();
  };

  await createTable();
  await getRow();

})();
