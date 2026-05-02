import { MikroConfigOptions } from './dist/index.js';

export * from './dist/index.js';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    mikro?: PowerPartial<MikroConfigOptions>;
  }
}
