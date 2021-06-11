import {join} from 'path';

export default () => {
  return {
    orm: {
      type: 'sqlite',
      synchronize: true,
      database: join(__dirname, '../../test.sqlite'),
      logging: true,
    }
  }
}