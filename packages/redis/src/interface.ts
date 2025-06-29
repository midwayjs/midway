import * as Redis from 'ioredis';
import { ClusterNode, ClusterOptions } from 'ioredis';
import {
  DefaultInstanceMetadata,
  ServiceDiscoveryBaseInstance,
  ServiceDiscoveryOptions,
  ServiceFactoryConfigOption
} from '@midwayjs/core';

export type RedisConfigOptions = Redis.RedisOptions
  | ({
    nodes?: ClusterNode[];
  } & ClusterOptions)

export interface RedisInstanceMetadata extends ServiceDiscoveryBaseInstance {
  /**
   * 服务名称
   */
  serviceName: string;
  /**
   * 服务实例 ID
   */
  id: string;
  /**
   * 服务实例的地址
   */
  host: string;
  /**
   * 服务实例的端口
   */
  port: number;
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

export interface RedisServiceDiscoveryOptions extends ServiceDiscoveryOptions<RedisInstanceMetadata> {
  /**
   * 服务信息的过期时间（秒）
   */
  ttl?: number;
  /**
   * 服务信息的 key 前缀
   */
  prefix?: string;
  /**
   * 服务实例配置
   */
  serviceOptions?: RedisInstanceMetadata | ((meta: DefaultInstanceMetadata) => RedisInstanceMetadata);
  /**
   * 下线状态的 TTL（秒）
   */
  downTTL?: number;
  /**
   * SCAN 命令每次遍历的数量，默认 100
   */
  scanCount?: number;
}


export type MidwayRedisConfigOptions = ServiceFactoryConfigOption<RedisConfigOptions> & {
  /**
   * Redis 服务发现配置
   */
  serviceDiscovery?: RedisServiceDiscoveryOptions;
};
