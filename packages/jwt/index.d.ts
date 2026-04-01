import { JwtUserConfig } from './dist/index';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    jwt?: JwtUserConfig;
  }
}
