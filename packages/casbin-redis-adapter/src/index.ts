import { NodeRedisAdapter } from './adapter';
import { RedisServiceFactory } from '@midwayjs/redis';
import { IMidwayContainer } from '@midwayjs/core';

export * from './adapter';

export function createAdapter(options: { clientName: string }) {
  return async (container: IMidwayContainer) => {
    const redisServiceFactory = await container.getAsync(RedisServiceFactory);
    const redisInstance = redisServiceFactory.get(options.clientName);
    return new NodeRedisAdapter(redisInstance);
  };
}
