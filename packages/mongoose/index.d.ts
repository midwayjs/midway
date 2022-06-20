import { ConnectionOptions } from './dist';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    mongoose?: DataSourceManagerConfigOption<{
      uri: string;
      options: ConnectionOptions;
    }>;
  }
}
