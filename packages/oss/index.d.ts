import { OSSServiceFactoryCreateClientConfigType } from './dist';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    oss?: ServiceFactoryConfigOption<OSSServiceFactoryCreateClientConfigType>;
  }
}
