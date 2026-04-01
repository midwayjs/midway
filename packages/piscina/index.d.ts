import { PiscinaConfig } from './dist/index';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    piscina?: PiscinaConfig;
  }
}
