import { close, createLightApp } from '@midwayjs/mock';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as Database from 'better-sqlite3';
import * as Drizzle from '../src';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

describe('/test/index.test.ts', () => {
  it('should test base case', async () => {
    const db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
    db.exec('CREATE TABLE users (id INTEGER, name VARCHAR, age INTEGER, PRIMARY KEY (id))');

    const app = await createLightApp('', {
      globalConfig: {
        drizzle: {
          dataSource: {
            default: drizzle(db),
          },
        }
      },
      imports: [
        Drizzle,
      ]
    });

    const users = sqliteTable(
      'users',
      {
        id: integer('id').primaryKey({ autoIncrement: true }),
        name: text('name'),
        age: integer('age').notNull(),
      }
    )

    const dataSourceManager = await app.getApplicationContext().getAsync(Drizzle.DrizzleDataSourceManager);

    const newDB = dataSourceManager.getDataSource('default') as ReturnType<typeof drizzle>;
    const insertRun = newDB.insert(users).values({ name: 'test', age: 18 }).run();
    expect(insertRun.changes).toBe(1);

    const row = newDB.select().from(users).get({ id: 1 });
    expect(row).toEqual({ id: 1, name: 'test', age: 18 });

    await close(app);
  });

});
