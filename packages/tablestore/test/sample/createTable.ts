import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { TableStoreService, PrimaryKeyType } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  await tableStoreService.createTable({
    tableMeta: {
      tableName: 'sampleTable',
      primaryKey: [
        {
          name: 'gid',
          type: PrimaryKeyType.INTEGER,
        },
        {
          name: 'uid',
          type: PrimaryKeyType.INTEGER,
        }
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
    streamSpecification: {
      enableStream: true, //开启Stream
      expirationTime: 24 //Stream的过期时间，单位是小时，最长为168，设置完以后不能修改
    }
  });

})();
