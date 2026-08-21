import { IMidwaySocketIOOptions } from './dist';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    socketIO?: IMidwaySocketIOOptions;
  }
}
