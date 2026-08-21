import type { DataSourceManagerConfigOption } from '@midwayjs/core';
import { ConnectionOptions } from './dist';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    mongoose?: DataSourceManagerConfigOption<{
      uri: string;
      options: ConnectionOptions;
    }>;
  }
}
