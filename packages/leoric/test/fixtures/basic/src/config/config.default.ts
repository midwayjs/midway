import * as path from 'path';

export const leoric = {
  dataSource: {
    custom: {
      dialect: 'sqlite',
      database: path.join(__dirname, '../../', 'database.sqlite'),
      baseDir: path.join(__dirname, '../model'),
      sync: true,
    },
  },
  defaultDataSourceName: 'custom',
}

export const koa = {
  keys: ['123']
}
