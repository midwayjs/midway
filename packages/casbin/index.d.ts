import { CasbinConfigOptions } from './dist/index';

export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    casbin?: Partial<CasbinConfigOptions>;
  }
}
