import { OneShotConfigOptions } from './dist/index';

export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    oneShot?: Partial<OneShotConfigOptions>;
  }
}
