import type { ParseContext } from 'zod/v4/core';

export * from './dist/index';
declare const zod: typeof import('./dist/index').default;
export default zod;

declare module '@midwayjs/core' {
  interface MidwayConfig {
    zod?: Partial<ParseContext>;
  }
}
