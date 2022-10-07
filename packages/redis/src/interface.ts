import * as Redis from 'ioredis';
import { ClusterNode, ClusterOptions } from 'ioredis';

export type RedisConfigOptions = Redis.RedisOptions
  | ({
  cluster?: boolean;
  nodes?: ClusterNode[];
} & ClusterOptions)
