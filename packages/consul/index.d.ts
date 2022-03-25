import { ConsulConfig } from './dist';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    consul?: ConsulConfig;
  }
}
