import { CodeDyeOptions } from './dist';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    codeDye?: Partial<CodeDyeOptions>;
  }
}
