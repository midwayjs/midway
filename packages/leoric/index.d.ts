import { LeoricConfigOption } from './dist/index';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    leoric?: LeoricConfigOption;
  }
}
