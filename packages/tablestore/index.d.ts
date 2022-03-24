import { TableStoreConfig } from './dist';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    tableStore?: ServiceFactoryConfigOption<TableStoreConfig>;
  }
}
