import { StaticFileOptions } from './dist/index';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    staticFile?: Partial<StaticFileOptions>;
  }
}
