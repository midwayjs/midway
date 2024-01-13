import { DataSourceManagerConfigOption } from '@midwayjs/core';
import { Bone, ConnectOptions } from 'leoric';

export type LeoricConfigOption = DataSourceManagerConfigOption<ConnectOptions, 'models'>;

export type ClassLikeBone = new (...args) => Bone;
