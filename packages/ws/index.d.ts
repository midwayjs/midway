import { IMidwayWSConfigurationOptions } from './dist';

export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    webSocket?: IMidwayWSConfigurationOptions;
  }
}
