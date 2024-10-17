import { LoadStrategy } from '@mikro-orm/core';
import { SqliteDriver, defineConfig } from '@mikro-orm/sqlite';
import { Book } from './entity/book.entity';
import { join } from 'path';

export default defineConfig({
  entities: [
    Book,
  ],
  dbName: join(__dirname, '../test.sqlite'),
  driver: SqliteDriver,       // 这里使用了 sqlite 做示例
  debug: true,
  // allowGlobalContext: true,
  timezone: '+08:00',
  loadStrategy: LoadStrategy.JOINED,
  allowGlobalContext: false,
  // forceUtcTimezone: true, //可以强制将日期保存在不带时区的日期
  // driverOptions: { connection: { timezone: '+08:00' } },
});
