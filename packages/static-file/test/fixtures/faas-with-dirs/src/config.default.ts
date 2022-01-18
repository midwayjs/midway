import { join } from 'path';

export const keys = '123';

export const staticFile = {
  dirs: {
    default: {
      prefix: '/',
      dir: join(__dirname, '../public')
    },
    another: {
      prefix: '/',
      dir: join(__dirname, '../static')
    }
  },
  buffer: true,
};
