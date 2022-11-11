import { Author, BaseEntity, Book, BookTag, Publisher } from '../entity';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { join } from 'path';

export default (appInfo) => {
  return {
    mikro: {
      dataSource: {
        default: {
          entities: [Author, Book, BookTag, Publisher, BaseEntity],
          dbName: join(__dirname, '../../test.sqlite'),
          type: 'sqlite',
          highlighter: new SqlHighlighter(),
          debug: true,
          allowGlobalContext: true,
        }
      },
      defaultDataSourceName: 'default',
    }
  }
}
