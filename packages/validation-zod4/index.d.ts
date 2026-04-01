export * from './dist/index';
export { default } from './dist/index';
import type { ParseContext } from 'zod/v4/core';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    zod?: Partial<ParseContext>;
  }
}
