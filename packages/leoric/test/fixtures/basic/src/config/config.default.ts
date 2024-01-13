import * as path from 'path';

export const leoric = {
  dataSource: {
    custom: {
      dialect: 'sqlite',
      database: path.join(__dirname, '../../', 'database.sqlite'),
      models: ['**/model/*{.ts,.js}'],
      sync: true,
    },
  },
  defaultDataSourceName: 'custom',
}
