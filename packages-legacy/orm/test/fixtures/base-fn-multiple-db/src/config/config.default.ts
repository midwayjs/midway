import {join} from 'path';

export default () => {
  return {
    orm: {
      default: {
        type: 'sqlite',
        database: join(__dirname, '../../default.sqlite'),
        logging: true,
        synchronize: true,
      },
      test: {
        type: 'sqlite',
        database: join(__dirname, '../../test.sqlite'),
        logging: true,
        synchronize: true
      }
    }
  }
}