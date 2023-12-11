import { IMidwayContainer } from '@midwayjs/core';
import { RedisServiceFactory } from '@midwayjs/redis';
import { Config } from 'cache-manager';
import { createRedisStore } from './store';

export function createStore(instanceName: string) {
  return async (container: IMidwayContainer, option?: Config) => {
    const redisServiceFactory = await container.getAsync(RedisServiceFactory);
    const redisInstance = redisServiceFactory.get(instanceName);
    return createRedisStore(redisInstance, option);
  };
}
