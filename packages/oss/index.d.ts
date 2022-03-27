import * as OSS from 'ali-oss';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    oss?: ServiceFactoryConfigOption<OSS.STSOptions | OSS.Options>;
  }
}
