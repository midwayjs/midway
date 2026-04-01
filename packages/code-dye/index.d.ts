import { CodeDyeOptions } from './dist';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    codeDye?: Partial<CodeDyeOptions>;
  }
}
