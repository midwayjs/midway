import { SessionOptions } from 'express-session';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    session?: Partial<
      SessionOptions & {
        enable: boolean;
      }
    >;
  }
}
