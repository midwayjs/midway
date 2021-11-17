export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    validate?: any;
  }
}
