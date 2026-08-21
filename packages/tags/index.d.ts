import type { ServiceFactoryConfigOption } from '@midwayjs/core';
import { ITagDialectOption } from './dist';

export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    tags?: ServiceFactoryConfigOption<ITagDialectOption>;
  }
}
