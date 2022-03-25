export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    otel?: Record<string, any>;
  }
}
