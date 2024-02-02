import { DrizzleConfigOptions } from './dist';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    drizzle?: PowerPartial<DrizzleConfigOptions>;
  }
}
