export * from './dist/index';
import { ParseParams } from 'zod';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    zod?: Partial<ParseParams>;
  }
}
