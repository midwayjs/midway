import {join} from 'path';
import { Message } from '../entity/message';
import { OriginUser, User } from '../entity/user';
import { EverythingSubscriber } from '../event';

export default (appInfo) => {
  return {
    typeorm: {
      dataSource: {
        default: {
          type: 'sqlite',
          synchronize: true,
          database: join(__dirname, '../../test.sqlite'),
          logging: true,
          entities: [Message, User, OriginUser],
          subscribers: [EverythingSubscriber],
          migrations: [
            '*/migration/*.ts'
          ],
        }
      },
      defaultDataSourceName: 'default',
    }
  }
}
