import {
  type MidwayAppInfo,
  type MidwayConfig,
} from '@midwayjs/core';
import { defineConfig, SqliteDriver } from '@mikro-orm/sqlite';
import { User } from '../entity/user.entity.js';
import { LoadStrategy } from '@mikro-orm/core';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { join } from 'path';

export default (appInfo: MidwayAppInfo): MidwayConfig => {
  return {
    mikro: {
      dataSource: {
        default1: defineConfig({
          entities: [User],
          dbName: join(appInfo.appDir, 'test1.sqlite'),
          driver: SqliteDriver, // 这里使用了 sqlite 做示例
          metadataProvider: ReflectMetadataProvider,
          // debug: true,
          timezone: '+08:00',
          loadStrategy: LoadStrategy.JOINED,
          // forceUtcTimezone: true, //可以强制将日期保存在不带时区的日期
          // driverOptions: { connection: { timezone: '+08:00' } },
          allowGlobalContext: true,
        }),
      },
    },
  } as MidwayConfig;
};
