import { ConsulOptions } from './dist';

export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    consul?: ServiceFactoryConfigOption<ConsulOptions>;
  }
}
