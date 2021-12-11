import { SessionOptions } from 'express-session';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    session: Partial<SessionOptions>;
  }
}
