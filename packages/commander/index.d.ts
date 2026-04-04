import { CommanderConfigOptions } from './dist/index';

export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    commander?: Partial<CommanderConfigOptions>;
  }
}
