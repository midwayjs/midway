import { Cache, Store, MemoryConfig, FactoryStore, FactoryConfig, MultiCache, WrapTTL } from 'cache-manager';

export type SingleCacheOptions<S extends Store = any, T extends object = any> = {
  store: 'memory';
  options?: MemoryConfig;
} | {
  store: S | (() => S | Promise<S>);
} | {
  store: FactoryStore<S, T>;
  options?: FactoryConfig<Parameters<FactoryStore<S, T>>[0]>,
}

export type CacheManagerOptions<S extends Store = any, T extends object = any> = SingleCacheOptions<S> | {
  store: Array<string | Cache | SingleCacheOptions<S, T> | (() => Cache | Promise<Cache>)>;
}

export type MidwayCache = Cache & {
  methodWrap?: <T>(
    key: string,
    fn: (...args) => Promise<T>,
    fnArgs: any[],
    ttl?: WrapTTL<T>
  ) => Promise<T>
}

export type MidwayMultiCache = MultiCache & {
  methodWrap?: <T>(
    key: string,
    fn: (...args) => Promise<T>,
    fnArgs: any[],
    ttl?: WrapTTL<T>
  ) => Promise<T>
}

export type MidwayUnionCache = MidwayCache | MidwayMultiCache;
