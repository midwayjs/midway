import { IOptions } from 'etcd3';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    etcd?: ServiceFactoryConfigOption<IOptions>;
  }
}
