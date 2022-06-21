import { SequelizeConfigOptions } from './dist';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    sequelize?: PowerPartial<SequelizeConfigOptions>;
  }
}
