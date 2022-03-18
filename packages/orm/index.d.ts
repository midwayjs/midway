import { ConnectionOptions } from './dist/index';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    orm?:
      | Partial<ConnectionOptions>
      | {
          [key: string]: Partial<ConnectionOptions>;
        };
  }
}
