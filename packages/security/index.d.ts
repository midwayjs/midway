import { SecurityOptions } from './dist/index';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    security?: Partial<SecurityOptions>;
  }
}
