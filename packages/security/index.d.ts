import { SecurityOptions } from './dist/index';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    security?: Partial<SecurityOptions>;
  }
}
