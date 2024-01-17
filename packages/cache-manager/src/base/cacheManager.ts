/**
 * fork from https://github.com/node-cache-manager/node-cache-manager/tree/master
 * reason: Support node.js v18 version below and add some features
 * for example: add methodWrap
 */

import { coalesceAsync } from './prmoiseCoalesce';
import {
  Cache,
  CachingConfig,
  Config,
  FactoryConfig,
  FactoryStore,
  MemoryCache,
  MemoryConfig,
  MemoryStore,
  Milliseconds,
  MultiCache,
  Store,
  Stores,
  WrapTTL,
} from './types';
import { memoryStore } from './store';

export async function caching(
  name: 'memory',
  args?: MemoryConfig
): Promise<MemoryCache>;
export async function caching<S extends Store>(store: S): Promise<Cache<S>>;
export async function caching<S extends Store, T extends object = never>(
  factory: FactoryStore<S, T>,
  args?: FactoryConfig<T>
): Promise<Cache<S>>;

/**
 * Generic caching interface that wraps any caching library with a compatible interface.
 */
export async function caching<S extends Store, T extends object = never>(
  factory: Stores<S, T>,
  args?: CachingConfig<T>
): Promise<Cache<S> | Cache<Store> | MemoryCache> {
  if (factory === 'memory') {
    const store = memoryStore(args as MemoryConfig);
    return createCache(store, args as MemoryConfig);
  }
  if (typeof factory === 'function') {
    const store = await factory(args as FactoryConfig<T>);
    return createCache(store, args);
  }

  return createCache(factory, args);
}

export function createCache(
  store: MemoryStore,
  args?: MemoryConfig
): MemoryCache;

export function createCache(store: Store, args?: Config): Cache<Store>;

/**
 * Create cache instance by store (non-async).
 */
export function createCache<S extends Store, C extends Config>(
  store: S,
  args?: C
): Cache<S> {
  return {
    /**
     * Wraps a function in cache. I.e., the first time the function is run,
     * its results are stored in cache so subsequent calls retrieve from cache
     * instead of calling the function.

     * @example
     * const result = await cache.wrap('key', () => Promise.resolve(1));
     *
     */
    wrap: async <T>(key: string, fn: () => Promise<T>, ttl?: WrapTTL<T>) => {
      return coalesceAsync(key, async () => {
        const value = await store.get<T>(key);
        if (value === undefined) {
          const result = await fn();
          const cacheTTL = typeof ttl === 'function' ? ttl(result) : ttl;
          await store.set<T>(key, result, cacheTTL);
          return result;
        } else if (args?.refreshThreshold) {
          const cacheTTL = typeof ttl === 'function' ? ttl(value) : ttl;
          const remainingTtl = await store.ttl(key);
          if (remainingTtl !== -1 && remainingTtl < args.refreshThreshold) {
            coalesceAsync(`+++${key}`, fn).then(result =>
              store.set<T>(key, result, cacheTTL)
            );
          }
        }
        return value;
      });
    },
    store: store as S,
    del: (key: string) => store.del(key),
    get: <T>(key: string) => store.get<T>(key),
    set: (key: string, value: unknown, ttl?: Milliseconds) =>
      store.set(key, value, ttl),
    reset: () => store.reset(),
    /**
     * cache function with args
     */
    methodWrap: async <T>(
      key: string,
      fn: (...args) => Promise<T>,
      fnArgs: any[],
      ttl?: WrapTTL<T>
    ): Promise<T> => {
      return coalesceAsync(key, async () => {
        const value = await store.get<T>(key);
        if (value === undefined) {
          const result = await fn(...fnArgs);
          const cacheTTL = typeof ttl === 'function' ? ttl(result) : ttl;
          await store.set(key, result, cacheTTL);
          return result;
        } else if (args?.refreshThreshold) {
          const cacheTTL = typeof ttl === 'function' ? ttl(value) : ttl;
          const remainingTtl = await store.ttl(key);
          if (remainingTtl !== -1 && remainingTtl < args.refreshThreshold) {
            // fn(...fnArgs).then(result => store.set(key, result, cacheTTL));
            coalesceAsync<T>(`+++${key}`, () => fn(...fnArgs)).then(result =>
              store.set<T>(key, result, cacheTTL)
            );
          }
        }
        return value;
      });
    },
  };
}

/**
 * Module that lets you specify a hierarchy of caches.
 */
export function multiCaching<Caches extends Cache[]>(
  caches: Caches
): MultiCache {
  const get = async <T>(key: string) => {
    for (const cache of caches) {
      try {
        const val = await cache.get<T>(key);
        if (val !== undefined) return val;
      } catch (e) {
        // ignore
      }
    }
  };
  const set = async <T>(
    key: string,
    data: T,
    ttl?: Milliseconds | undefined
  ) => {
    await Promise.all(caches.map(cache => cache.set(key, data, ttl)));
  };

  return {
    get,
    set,
    del: async key => {
      await Promise.all(caches.map(cache => cache.del(key)));
    },
    async wrap<T>(
      key: string,
      fn: () => Promise<T>,
      ttl?: WrapTTL<T>
    ): Promise<T> {
      let value: T | undefined;
      let i = 0;
      for (; i < caches.length; i++) {
        try {
          value = await caches[i].get<T>(key);
          if (value !== undefined) break;
        } catch (e) {
          // ignore
        }
      }
      if (value === undefined) {
        const result = await fn();
        const cacheTTL = typeof ttl === 'function' ? ttl(result) : ttl;
        await set<T>(key, result, cacheTTL);
        return result;
      } else {
        const cacheTTL = typeof ttl === 'function' ? ttl(value) : ttl;
        Promise.all(
          caches.slice(0, i).map(cache => cache.set(key, value, cacheTTL))
        ).then();
        caches[i].wrap(key, fn, ttl).then(); // call wrap for store for internal refreshThreshold logic, see: src/caching.ts caching.wrap
      }
      return value;
    },
    reset: async () => {
      await Promise.all(caches.map(x => x.reset()));
    },
    mget: async (...keys: string[]) => {
      const values = new Array(keys.length).fill(undefined);
      for (const cache of caches) {
        if (values.every(x => x !== undefined)) break;
        try {
          const val = await cache.store.mget(...keys);
          val.forEach((v, i) => {
            if (values[i] === undefined && v !== undefined) values[i] = v;
          });
        } catch (e) {
          // ignore
        }
      }
      return values;
    },
    mset: async (args: [string, unknown][], ttl?: Milliseconds) => {
      await Promise.all(caches.map(cache => cache.store.mset(args, ttl)));
    },
    mdel: async (...keys: string[]) => {
      await Promise.all(caches.map(cache => cache.store.mdel(...keys)));
    },
    methodWrap: async <T>(
      key: string,
      fn: (...args) => Promise<T>,
      fnArgs: any[],
      ttl?: WrapTTL<T>
    ): Promise<T> => {
      let value: T | undefined;
      let i = 0;
      for (; i < caches.length; i++) {
        try {
          value = await caches[i].get<T>(key);
          if (value !== undefined) break;
        } catch (e) {
          // ignore
        }
      }
      if (value === undefined) {
        const result = await fn(...fnArgs);
        const cacheTTL = typeof ttl === 'function' ? ttl(result) : ttl;
        await set(key, result, cacheTTL);
        return result;
      } else {
        const cacheTTL = typeof ttl === 'function' ? ttl(value) : ttl;
        Promise.all(
          caches.slice(0, i).map(cache => cache.set(key, value, cacheTTL))
        ).then();
        caches[i].methodWrap(key, fn, fnArgs, ttl).then(); // call wrap for store for internal refreshThreshold logic, see: src/caching.ts caching.wrap
      }
      return value;
    },
  };
}
