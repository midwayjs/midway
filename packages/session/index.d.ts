import { opts } from 'koa-session';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    session: Partial<
      opts & {
        enable: boolean;
      }
    >;
  }
}
