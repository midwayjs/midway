import * as path from 'path';

export const sequelize = {
  options: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../test', 'database.sqlite'),
  },
  sync: false,
};
