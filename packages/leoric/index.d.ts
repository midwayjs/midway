import { ConnectOptions } from './dist/index';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    leoric?: PowerPartial<
      ConnectOptions & {
        baseDir: string;
        migrations: string;
      }
    >;
  }
}
