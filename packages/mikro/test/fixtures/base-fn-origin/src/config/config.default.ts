import { Author, BaseEntity, Book, BookTag, Publisher } from '../entity';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

export default (appInfo) => {
  return {
    mikro: {
      dataSource: {
        default: {
          entities: [Author, Book, BookTag, Publisher, BaseEntity],
          dbName: 'mikro-orm-ts',
          type: 'sqlite',
          port: 3307,
          highlighter: new SqlHighlighter(),
          debug: true,
          allowGlobalContext: true,
        }
      }
    }
  }
}
