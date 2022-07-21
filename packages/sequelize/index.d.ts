import { SequelizeConfigOptions } from './dist';

import { SequelizeOptions } from 'sequelize-typescript';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    sequelize?:
      | PowerPartial<SequelizeConfigOptions>
      | {
          options?: SequelizeOptions;
          sync?: boolean;
        };
  }
}
