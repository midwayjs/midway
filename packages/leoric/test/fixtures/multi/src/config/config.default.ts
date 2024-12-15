import * as path from 'path';

export const keys = 'hakuna matata';

export const leoric = {
  dataSource: {
    custom: {
      dialect: 'sqlite',
      database: path.join(__dirname, '../../', 'database.sqlite'),
      models: ['model/*{.ts,.js}'],
      sync: true,
    },
    subsystem: {
      dialect: 'sqlite',
      database: path.join(__dirname, '../../', 'subsystem.sqlite'),
      models: ['subsystem/model/*{.ts,.js}'],
      sync: true,
    }
  },
  defaultDataSourceName: 'custom',
}
