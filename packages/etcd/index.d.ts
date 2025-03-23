import { IOptions } from 'etcd3';
export * from './dist/index';
import { ServiceDiscoveryOptions } from '@midwayjs/core';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    etcd?: ServiceFactoryConfigOption<IOptions> & {
      serviceDiscovery?: ServiceDiscoveryOptions;
    };
  }
}
