import type { Config, Store } from './base';
import type { Redis, RedisServiceFactory } from '@midwayjs/redis';
import {
  IMidwayContainer,
  MidwayCommonError,
  safeRequire,
} from '@midwayjs/core';

const getVal = (value: unknown) => JSON.stringify(value) || '"undefined"';
export interface RedisStore extends Store {
  readonly isCacheable: (value: unknown) => boolean;
}

export function createRedisStore(instanceName: string) {
  return async (options: Config, container: IMidwayContainer) => {
    const { RedisServiceFactory } = safeRequire('@midwayjs/redis');
    const redisServiceFactory: RedisServiceFactory = await container.getAsync(
      RedisServiceFactory
    );
    const redisInstance = redisServiceFactory.get(instanceName);
    return createStore(redisInstance, options);
  };
}

function createStore(redisCache: Redis, options?: Config) {
  const isCacheable =
    options?.isCacheable || (value => value !== undefined && value !== null);

  const keys = (pattern: string) => redisCache.keys(pattern);

  return {
    async get<T>(key: string) {
      const val = await redisCache.get(key);
      if (val === undefined || val === null) return undefined;
      else {
        try {
          return JSON.parse(val) as T;
        } catch (e) {
          return val;
        }
      }
    },
    async set(key, value, ttl) {
      if (!isCacheable(value))
        throw new MidwayCommonError(`"${value}" is not a cacheable value`);
      const t = ttl === undefined ? options?.ttl : ttl;
      if (t !== undefined && t !== 0)
        await redisCache.set(key, getVal(value), 'PX', t);
      else await redisCache.set(key, getVal(value));
    },
    async mset(args, ttl) {
      const t = ttl === undefined ? options?.ttl : ttl;
      if (t !== undefined && t !== 0) {
        const multi = redisCache.multi();
        for (const [key, value] of args) {
          if (!isCacheable(value))
            throw new MidwayCommonError(
              `"${getVal(value)}" is not a cacheable value`
            );
          multi.set(key, getVal(value), 'PX', t);
        }
        await multi.exec();
      } else
        await redisCache.mset(
          args.flatMap(([key, value]) => {
            if (!isCacheable(value))
              throw new Error(`"${getVal(value)}" is not a cacheable value`);
            return [key, getVal(value)] as [string, string];
          })
        );
    },
    mget: (...args) =>
      redisCache
        .mget(args)
        .then(x =>
          x.map(x =>
            x === null || x === undefined
              ? undefined
              : (JSON.parse(x) as unknown)
          )
        ),
    async mdel(...args) {
      await redisCache.del(args);
    },
    async del(key) {
      await redisCache.del(key);
    },
    ttl: async key => redisCache.pttl(key),
    keys: (pattern = '*') => keys(pattern),
    reset: () => {
      throw new MidwayCommonError(
        'flushdb() is too dangerous, if necessary, please use redisServiceFactory.get(client) to get the instance and call it manually.'
      );
    },
    isCacheable,
  } as RedisStore;
}
