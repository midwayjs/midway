export * from './dist/index';
export { default } from './dist/index';
import { ParseParams } from 'zod';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    zod?: Partial<ParseParams>;
  }
}
