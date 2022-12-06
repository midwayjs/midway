import * as path from 'path';
import { HelloModel } from '../model/hello';
import { UserModel } from '../model/user';

export const sequelize = {
  dataSource: {
    custom: {
      dialect: 'sqlite',
      storage: path.join(__dirname, '../../', 'database.sqlite'),
      sync: true,
      entities: [HelloModel, UserModel],
      // repositoryMode: true,
    }
  },
  defaultDataSourceName: 'custom',
}

export const koa = {
  keys: ['123']
}
