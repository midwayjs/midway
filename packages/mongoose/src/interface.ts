import * as mongoose from 'mongoose';

interface M5 {
  ConnectionOptions: unknown;
}
interface M6 {
  ConnectOptions: unknown;
}

// 不同的 mongoose 版本 options 字段定义不同
type ExtractConnectionOptions<T> = T extends M5 ? T['ConnectionOptions']: T extends M6 ? T['ConnectOptions']: never;
type ConnectionOptions = ExtractConnectionOptions<typeof mongoose>;

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    mongoose?: ServiceFactoryConfigOption<{
      uri: string;
      options: ConnectionOptions;
    }>;
  }
}
