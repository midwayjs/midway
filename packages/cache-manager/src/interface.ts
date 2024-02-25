import { Cache, Store, MemoryConfig, FactoryStore, FactoryConfig, MultiCache } from './base';

export type SingleCacheOptions<S extends Store = any, T extends object = any> = {
  store: 'memory';
  options?: MemoryConfig;
} | {
  store: S | (() => S | Promise<S>);
  options?: MemoryConfig;
} | {
  store: FactoryStore<S, T>;
  options?: FactoryConfig<Parameters<FactoryStore<S, T>>[0]>,
}

export type CacheManagerOptions<S extends Store = any, T extends object = any> = SingleCacheOptions<S> | {
  store: Array<string | Cache | SingleCacheOptions<S, T> | (() => Cache | Promise<Cache>)>;
  options?: MemoryConfig;
}

export type MidwayCache = Cache;

export type MidwayMultiCache = MultiCache;

export type MidwayUnionCache = MidwayCache | MidwayMultiCache;
