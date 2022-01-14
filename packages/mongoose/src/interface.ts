import * as mongoose from 'mongoose';

interface M5 {
  ConnectionOptions: unknown;
}
interface M6 {
  ConnectOptions: unknown;
}
interface Plus {
  Connection: any;
}

// 不同的 mongoose 版本 options 字段定义不同
declare type ExtractConnectionOptionsFromConnection<T extends (...args: any[]) => any> = Parameters<T>[1];

declare type ExtractConnectionOptions<T> =
  T extends M5 ? T['ConnectionOptions'] :
    T extends M6 ? T['ConnectOptions'] :
      T extends Plus ? ExtractConnectionOptionsFromConnection<T['Connection']['prototype']['openUri']> :
        never;
type ConnectionOptions = ExtractConnectionOptions<typeof mongoose>;

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    mongoose?: ServiceFactoryConfigOption<{
      uri: string;
      options: ConnectionOptions;
    }>;
  }
}
