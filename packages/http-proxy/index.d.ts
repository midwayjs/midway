import { HttpProxyConfig } from './dist/index';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    httpProxy?: Partial<HttpProxyConfig> | Partial<HttpProxyConfig>[];
  }
}
