import { ServiceDiscoveryOptions } from '@midwayjs/core';

// 扩展 ServiceDiscoveryOptions 接口
export interface EtcdServiceDiscoveryOptions extends ServiceDiscoveryOptions {
  ttl?: number;
}
