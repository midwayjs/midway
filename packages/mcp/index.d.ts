import { IMidwayMCPConfigurationOptions } from './dist/index';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    mcp?: PowerPartial<IMidwayMCPConfigurationOptions>;
  }
}
