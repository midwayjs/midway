import * as LRUCache from 'lru-cache';

export type MultiCache = Omit<Cache, 'store'> &
  Pick<Cache['store'], 'mset' | 'mget' | 'mdel'>;

export type Config = {
  ttl?: Milliseconds;
  refreshThreshold?: Milliseconds;
  isCacheable?: (val: unknown) => boolean;
};

export type Milliseconds = number;

export type Store = {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, data: T, ttl?: Milliseconds): Promise<void>;
  del(key: string): Promise<void>;
  reset(): Promise<void>;
  mset(args: [string, unknown][], ttl?: Milliseconds): Promise<void>;
  mget(...args: string[]): Promise<unknown[]>;
  mdel(...args: string[]): Promise<void>;
  keys(pattern?: string): Promise<string[]>;
  ttl(key: string): Promise<number>;
};

export type StoreConfig = Config;

export type FactoryConfig<T> = T & Config;
export type FactoryStore<S extends Store, T extends object = never> = (
  config?: FactoryConfig<T>
) => S | Promise<S>;

export type Stores<S extends Store, T extends object> =
  | 'memory'
  | Store
  | FactoryStore<S, T>;
export type CachingConfig<T> = MemoryConfig | StoreConfig | FactoryConfig<T>;
export type WrapTTL<T> = Milliseconds | ((v: T) => Milliseconds);
export type Cache<S extends Store = Store> = {
  set: (key: string, value: unknown, ttl?: Milliseconds) => Promise<void>;
  get: <T>(key: string) => Promise<T | undefined>;
  del: (key: string) => Promise<void>;
  reset: () => Promise<void>;
  wrap<T>(key: string, fn: () => Promise<T>, ttl?: WrapTTL<T>): Promise<T>;
  methodWrap<T>(
    key: string,
    fn: (...args) => Promise<T>,
    fnArgs: any[],
    ttl?: WrapTTL<T>
  ): Promise<T>;
  store: S;
};

export type LRU = LRUCache<string, any>;
type Pre = LRUCache.LimitedByTTL;
type Options = Omit<Pre, 'ttlAutopurge'> & Partial<Pick<Pre, 'ttlAutopurge'>>;
export type MemoryConfig = {
  max?: number;
  sizeCalculation?: (value: unknown, key: string) => number;
  shouldCloneBeforeSet?: boolean;
} & Options &
  Config;

export type MemoryStore = Store & {
  get size(): number;
  dump: LRU['dump'];
  load: LRU['load'];
  calculatedSize: LRU['calculatedSize'];
};
export type MemoryCache = Cache<MemoryStore>;
