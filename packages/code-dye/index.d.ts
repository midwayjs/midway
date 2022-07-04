import { CodeDyeOptions } from './dist/index';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    codeDye?: Partial<CodeDyeOptions>;
  }
}
