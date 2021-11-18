import * as OSS from 'ali-oss';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    oss?: ServiceFactoryConfigOption<OSS.STSOptions | OSS.Options>;
  }
}
