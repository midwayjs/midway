import { RedisAdapterConfig } from './dist/index';
import '@midwayjs/casbin';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    casbinRedis?: Partial<RedisAdapterConfig>;
  }
}
