import { IMidwayMCPConfigurationOptions } from './dist/index';

export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    mcp?: PowerPartial<IMidwayMCPConfigurationOptions>;
  }
}
