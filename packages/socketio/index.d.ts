import { IMidwaySocketIOConfigurationOptions } from './dist';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    socketIO?: IMidwaySocketIOConfigurationOptions;
  }
}
