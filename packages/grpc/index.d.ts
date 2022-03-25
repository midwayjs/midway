import { DefaultConfig, IMidwayGRPFrameworkOptions } from './dist';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    grpcServer?: IMidwayGRPFrameworkOptions;
    grpc?: PowerPartial<DefaultConfig>;
  }
}
