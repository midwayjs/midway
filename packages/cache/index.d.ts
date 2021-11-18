import { CacheOptions, StoreConfig } from 'cache-manager';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    cache?: StoreConfig & CacheOptions;
  }
}
