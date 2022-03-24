import { SequelizeOptions } from 'sequelize-typescript';

export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    sequelize?: {
      options?: SequelizeOptions;
      sync?: boolean;
    };
  }
}
