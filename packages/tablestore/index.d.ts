import { TableStoreConfig } from './dist';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    tableStore?: ServiceFactoryConfigOption<TableStoreConfig>;
  }
}
