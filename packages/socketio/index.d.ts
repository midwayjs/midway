import { IMidwaySocketIOConfigurationOptions } from './dist';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    socketIO?: IMidwaySocketIOConfigurationOptions;
  }
}
