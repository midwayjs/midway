import type { PowerPartial } from '@midwayjs/core';
import { SequelizeConfigOptions } from './dist';

import { SequelizeOptions } from 'sequelize-typescript';

export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    sequelize?:
      | PowerPartial<SequelizeConfigOptions>
      | {
          options?: SequelizeOptions;
          sync?: boolean;
        };
  }
}
