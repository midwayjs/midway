export * from './dist/index';
import type { ParseContext } from 'zod/v4/core';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    zod?: Partial<ParseContext>;
  }
}
