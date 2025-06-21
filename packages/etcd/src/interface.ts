import {
  ServiceDiscoveryBaseInstance,
  ServiceDiscoveryOptions,
  DefaultInstanceMetadata,
  ServiceFactoryConfigOption
} from '@midwayjs/core';
import { IOptions } from 'etcd3';

export interface EtcdInstanceMetadata extends ServiceDiscoveryBaseInstance {
  /**
   * 服务名称
   */
  serviceName: string;
  /**
   * 服务实例 ID
   */
  id: string;
  /**
   * 服务实例的过期时间（秒）
   */
  ttl?: number;
  /**
   * 服务实例的标签
   */
  tags?: string[];
  /**
   * 服务实例的元数据
   */
  meta?: Record<string, string>;
  /**
   * 服务实例的状态
   */
  status?: 'UP' | 'DOWN';
}

export interface EtcdServiceDiscoveryOptions extends ServiceDiscoveryOptions<EtcdInstanceMetadata> {
  /**
   * 命名空间
   */
  namespace?: string;
  /**
   * 服务信息的过期时间（秒）
   */
  ttl?: number;
  /**
   * 服务实例配置
   */
  serviceOptions?: EtcdInstanceMetadata | ((meta: DefaultInstanceMetadata) => EtcdInstanceMetadata);
}

export type MidwayEtcdConfigOptions = ServiceFactoryConfigOption<IOptions> & {
  serviceDiscovery?: EtcdServiceDiscoveryOptions;
}
