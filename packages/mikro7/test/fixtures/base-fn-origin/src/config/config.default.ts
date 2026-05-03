import { Author, BaseEntity, Book, BookTag, Publisher } from '../entity/index.js';
import { join } from 'path';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';

const appDir = join(process.env.MIKRO7_FIXTURES_DIR, 'base-fn-origin');

export default (appInfo) => {
  return {
    midwayLogger: {
      clients: {
        mikroLogger: {
          disableFile: false,
          transports: {
            console: {
              autoColors: false,
            },
            file: {
              fileLogName: 'mikro.log',
            }
          },
        }
      }
    },
    mikro: {
      dataSource: {
        default: {
          entities: [Author, Book, BookTag, Publisher, BaseEntity],
          dbName: join(appDir, 'test.sqlite'),
          driver: SqliteDriver,
          metadataProvider: ReflectMetadataProvider,
          debug: true,
          allowGlobalContext: true,
          logger: 'mikroLogger',
          colors: false,
        }
      },
      defaultDataSourceName: 'default',
    }
  }
}
