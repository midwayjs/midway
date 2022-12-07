import { RedisServiceFactory } from '@midwayjs/redis';
import { IMidwayContainer } from '@midwayjs/core';
import { NodeRedisAdapter } from './adapter';
import { NodeRedisWatcher } from './watcher';

export * from './adapter';
export * from './watcher';

export function createAdapter(options: { clientName: string }) {
  return async (container: IMidwayContainer) => {
    const redisServiceFactory = await container.getAsync(RedisServiceFactory);
    const redisInstance = redisServiceFactory.get(options.clientName);
    return new NodeRedisAdapter(redisInstance);
  };
}

export function createWatcher(options: {
  pubClientName: string;
  subClientName: string;
  keyName?: string;
}) {
  return async (container: IMidwayContainer) => {
    const redisServiceFactory = await container.getAsync(RedisServiceFactory);
    const pubRedisInstance = redisServiceFactory.get(options.pubClientName);
    const subClientName = redisServiceFactory.get(options.subClientName);
    return new NodeRedisWatcher({
      subscribeKeyName: options.keyName,
      subClient: subClientName,
      pubClient: pubRedisInstance,
    });
  };
}
