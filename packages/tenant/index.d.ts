export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    tenant?: Record<string, any>;
  }
}
