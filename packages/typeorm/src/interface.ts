import { DataSourceOptions } from 'typeorm';
import { DataSourceManagerConfigOption } from '@midwayjs/core';

export type typeormConfigOptions = DataSourceManagerConfigOption<DataSourceOptions> & {
  allowExecuteMigrations: boolean;
};
