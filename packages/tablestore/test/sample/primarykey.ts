import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { PrimaryKeyOption, PrimaryKeyType, TableStoreService, Long, Condition, PK_AUTO_INCR, RowExistenceExpectation, ReturnType } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  async function putRow() {
    const putParams = {
      tableName: 'autoIncTable',
      condition: new Condition(RowExistenceExpectation.IGNORE, null),
      primaryKey: [
        {'stringPK': 'pk1'},
        {'integerPK': Long.fromNumber(1)},
        {'binaryPK': new Buffer('test')},
        {'autoIncPK': PK_AUTO_INCR}
      ],
      attributeColumns: [
        {'col1': 'col1val'}
      ],
      returnContent: {returnType: ReturnType.Primarykey}
    };

    const data = await tableStoreService.putRow(putParams);
    await tableStoreService.getRow(data.row.primaryKey)

  }

  async function createTable() {
    const createParams = {
      tableMeta: {
        tableName: 'autoIncTable',
        primaryKey: [
          {
            name: 'stringPK',
            type: PrimaryKeyType.STRING,
          },
          {
            name: 'integerPK',
            type: PrimaryKeyType.INTEGER,
          },
          {
            name: 'binaryPK',
            type: PrimaryKeyType.BINARY,
          },
          {
            name: 'autoIncPK',
            type: PrimaryKeyType.INTEGER,
            option: PrimaryKeyOption.AUTO_INCREMENT //自增列，指定otpion为AUTO_INCREMENT
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
      }
    };

    await tableStoreService.createTable(createParams);

    await putRow()
  }

  await createTable()

})();
