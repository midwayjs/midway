import { IMidwayHonoConfigurationOptions } from './dist';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    hono?: IMidwayHonoConfigurationOptions;
  }
}
