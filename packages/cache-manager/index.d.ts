import type { ServiceFactoryConfigOption } from '@midwayjs/core';
import { CacheManagerOptions } from './dist/index';

export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    cacheManager?: ServiceFactoryConfigOption<CacheManagerOptions>;
  }
}
