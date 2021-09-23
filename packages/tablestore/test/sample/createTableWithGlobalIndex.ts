import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { TableStoreService, PrimaryKeyType, DefinedColumnType } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  await tableStoreService.createTable({
    tableMeta: {
      tableName: 'sdkGlobalTest',
      primaryKey: [
        {
          name: 'pk1',
          type: PrimaryKeyType.INTEGER
        },
        {
          name: 'pk2',
          type: PrimaryKeyType.INTEGER
        }
      ],
      definedColumn: [
        {
          "name": "col1",
          "type": DefinedColumnType.DCT_INTEGER
        },
        {
          "name": "col2",
          "type": DefinedColumnType.DCT_INTEGER
        }
      ],
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
    streamSpecification: {
      enableStream: false, //globalIndex不支持开启Stream
    },
    indexMetas: [
      {
        name: "sdkIndex1",
        primaryKey: ["pk2"],
        definedColumn: ["col1", "col2"]
      },
      {
        name: "sdkIndex2",
        primaryKey: ["col1"],
        definedColumn: ["col2"]
      }
    ]
  });

})();
