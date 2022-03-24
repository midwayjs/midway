import { DefaultConfig, IMidwayGRPFrameworkOptions } from './dist';

export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    grpcServer?: IMidwayGRPFrameworkOptions;
    grpc?: PowerPartial<DefaultConfig>;
  }
}
