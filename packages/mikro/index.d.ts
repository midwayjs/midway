import { MikroConfigOptions } from './dist/index';

export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    mikro?: PowerPartial<MikroConfigOptions>;
  }
}
