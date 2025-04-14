import { IOptions } from 'etcd3';
import { EtcdServiceDiscoveryOptions } from './dist/index';
import { ServiceDiscoveryOptions } from '@midwayjs/core';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    etcd?: ServiceFactoryConfigOption<IOptions> & {
      serviceDiscovery?: EtcdServiceDiscoveryOptions;
    };
  }
}
