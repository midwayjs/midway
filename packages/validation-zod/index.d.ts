import { ParseParams } from 'zod';

export * from './dist/index';
declare const zod: typeof import('./dist/index').default;
export default zod;

declare module '@midwayjs/core' {
  interface MidwayConfig {
    zod?: Partial<ParseParams>;
  }
}
