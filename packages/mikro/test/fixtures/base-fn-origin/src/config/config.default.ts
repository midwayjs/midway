import { Author, BaseEntity, Book, BookTag, Publisher } from '../entity';
import { join } from 'path';
import { SqliteDriver } from '@mikro-orm/sqlite';

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
          dbName: join(__dirname, '../../test.sqlite'),
          driver: SqliteDriver,
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
