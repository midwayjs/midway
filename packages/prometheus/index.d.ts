import { DefaultMetricsCollectorConfiguration } from 'prom-client';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    prometheus?: DefaultMetricsCollectorConfiguration;
  }
}
