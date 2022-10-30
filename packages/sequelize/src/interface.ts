import { DataSourceManagerConfigOption } from '@midwayjs/core';
import { SequelizeOptions } from 'sequelize-typescript';
import { SyncOptions } from 'sequelize';

export type SequelizeConfigOptions = DataSourceManagerConfigOption<SequelizeOptions & {
  sync?: boolean;
  syncOptions?: SyncOptions;
}>;
