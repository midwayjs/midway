import { NextServerOptions } from 'next/dist/server/next';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    next?: NextServerOptions;
  }
}
