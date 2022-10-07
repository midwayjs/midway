import { RedisConfigOptions } from '@midwayjs/redis';

export interface RedisAdapterConfig {
  clientName?: string;
  clientOption?: RedisConfigOptions;
}

export interface Filters {
  [ptype: string]: string[];
}
