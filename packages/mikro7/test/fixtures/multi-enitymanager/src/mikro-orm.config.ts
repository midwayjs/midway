import { LoadStrategy } from '@mikro-orm/core';
import { SqliteDriver, defineConfig } from '@mikro-orm/sqlite';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { Book } from './entity/book.entity.js';
import { Author } from './components/m1/src/entity/author.entity.js';
import { join } from 'path';

const appDir = join(process.env.MIKRO7_FIXTURES_DIR, 'multi-enitymanager');

export default defineConfig({
  entities: [
    Book,
    Author,
  ],
  dbName: join(appDir, 'test.sqlite'),
  driver: SqliteDriver,       // 这里使用了 sqlite 做示例
  metadataProvider: ReflectMetadataProvider,
  debug: true,
  // allowGlobalContext: true,
  timezone: '+08:00',
  loadStrategy: LoadStrategy.JOINED,
  allowGlobalContext: false,
  // forceUtcTimezone: true, //可以强制将日期保存在不带时区的日期
  // driverOptions: { connection: { timezone: '+08:00' } },
});
