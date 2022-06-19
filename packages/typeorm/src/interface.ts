import { DataSourceOptions } from 'typeorm';

export type typeormConfig = {
  typeorm: {
    dataSource: {
      [key: string]: DataSourceOptions
    }
  }
}
