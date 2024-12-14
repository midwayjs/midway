import { DataSourceManagerConfigOption } from '@midwayjs/core';
import { SequelizeOptions } from 'sequelize-typescript';

export type SequelizeConfigOptions = DataSourceManagerConfigOption<SequelizeOptions>;
