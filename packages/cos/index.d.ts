import * as COS from 'cos-nodejs-sdk-v5';

export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    cos?: ServiceFactoryConfigOption<COS.COSOptions>;
  }
}
