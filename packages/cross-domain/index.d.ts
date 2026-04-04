import { CORSOptions, JSONPOptions } from './dist/index';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    cors?: Partial<CORSOptions>;
    jsonp?: Partial<JSONPOptions>;
  }
}
