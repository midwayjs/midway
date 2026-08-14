import LRUCache from 'lru-cache';
import * as cloneDeep from 'lodash.clonedeep';
import { MemoryConfig, MemoryStore, LRU } from './types';

function clone<T>(object: T): T {
  if (typeof object === 'object' && object !== null) {
    return cloneDeep(object);
  }
  return object;
}

/**
 * Wrapper for lru-cache.
 */
export function memoryStore(args?: MemoryConfig): MemoryStore {
  const shouldCloneBeforeSet = args?.shouldCloneBeforeSet !== false; // clone by default
  const isCacheable = args?.isCacheable ?? (val => val !== undefined);

  const lruOpts = {
    ttlAutopurge: true,
    ...args,
    max: args?.max || 500,
    ttl: args?.ttl !== undefined ? args.ttl : 0,
  };

  const lruCache = new LRUCache(lruOpts);

  return {
    async del(key) {
      lruCache.delete(key);
    },
    get: async <T>(key: string) => lruCache.get(key) as T,
    keys: async () => [...(lruCache.keys() as any)],
    mget: async (...args) => args.map(x => lruCache.get(x)),
    async mset(args, ttl?) {
      const opt = { ttl: ttl !== undefined ? ttl : lruOpts.ttl } as const;
      for (const [key, value] of args) {
        if (!isCacheable(value))
          throw new Error(`no cacheable value ${JSON.stringify(value)}`);
        if (shouldCloneBeforeSet) lruCache.set(key, clone(value), opt);
        else lruCache.set(key, value, opt);
      }
    },
    async mdel(...args) {
      for (const key of args) lruCache.delete(key);
    },
    async reset() {
      lruCache.clear();
    },
    ttl: async key => lruCache.getRemainingTTL(key),
    async set(key, value, opt) {
      if (!isCacheable(value))
        throw new Error(`no cacheable value ${JSON.stringify(value)}`);
      if (shouldCloneBeforeSet) value = clone(value);

      const ttl = opt !== undefined ? opt : lruOpts.ttl;

      lruCache.set(key, value, { ttl });
    },
    get calculatedSize() {
      return lruCache.calculatedSize;
    },
    /**
     * This method is not available in the caching modules.
     */
    get size() {
      return lruCache.size;
    },
    /**
     * This method is not available in the caching modules.
     */
    dump: () => lruCache.dump() as any,
    /**
     * This method is not available in the caching modules.
     */
    load: (...args: Parameters<LRU['load']>) => lruCache.load(...args),
  };
}
