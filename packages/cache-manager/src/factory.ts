import {
  ApplicationContext,
  Config,
  IMidwayContainer,
  Init,
  MidwayCommonError,
  Provide,
  Scope,
  ScopeEnum,
  ServiceFactory,
  ServiceFactoryConfigOption,
} from '@midwayjs/core';
import { caching, multiCaching, WrapTTL, CachingConfig } from 'cache-manager';
import {
  CacheManagerOptions,
  MidwayCache,
  MidwayMultiCache,
  MidwayUnionCache,
} from './interface';
import { coalesceAsync } from 'promise-coalesce';

@Provide()
@Scope(ScopeEnum.Singleton)
export class CachingFactory extends ServiceFactory<MidwayUnionCache> {
  @Config('cacheManager')
  protected cacheManagerConfig: ServiceFactoryConfigOption<CacheManagerOptions>;

  @ApplicationContext()
  protected applicationContext: IMidwayContainer;

  @Init()
  protected async init() {
    await this.initClients(this.cacheManagerConfig);
  }

  protected async createClient(
    config: CacheManagerOptions<any>,
    clientName: string
  ): Promise<void | MidwayUnionCache> {
    if (Array.isArray(config.store)) {
      const newFactory = [];
      for (const storeConfig of config.store) {
        if (typeof storeConfig === 'string') {
          if (!this.has(storeConfig)) {
            throw new MidwayCommonError(
              `cache instance "${storeConfig}" not found in "${clientName}", please check your configuration.`
            );
          }
          newFactory.push(this.get(storeConfig));
        } else if (typeof storeConfig === 'function') {
          newFactory.push(await storeConfig());
        } else if (storeConfig['wrap']) {
          // wrap is a caching object method
          newFactory.push(storeConfig['wrap']);
        } else if (typeof storeConfig === 'object') {
          if (typeof storeConfig.store === 'function') {
            storeConfig.store = await storeConfig.store(
              this.applicationContext,
              storeConfig['options']
            );
          }
          if (!storeConfig.store) {
            throw new MidwayCommonError(
              `cache instance "${clientName}" store is undefined, please check your configuration.`
            );
          }
          newFactory.push(
            await caching(storeConfig.store, storeConfig['options'])
          );
        } else {
          throw new MidwayCommonError('invalid cache config');
        }
      }
      const cacheInstance = await multiCaching(newFactory);
      return this.wrapMultiCaching(cacheInstance, newFactory);
    } else {
      if (typeof config.store === 'function') {
        config.store = await config.store(
          this.applicationContext,
          config['options']
        );
      }
      if (!config.store) {
        throw new MidwayCommonError(
          `cache instance "${clientName}" store is undefined, please check your configuration.`
        );
      }
      const cacheInstance = await caching(config.store, config['options']);
      return this.wrapCaching(cacheInstance, config['options']);
    }
  }

  public wrapCaching(
    cacheInstance: MidwayCache,
    cachingArgs?: CachingConfig<any>
  ): MidwayCache {
    if (cacheInstance.methodWrap) {
      return cacheInstance;
    }

    cacheInstance.methodWrap = async <T>(
      key: string,
      fn: (...args) => Promise<T>,
      fnArgs: any[],
      ttl?: WrapTTL<T>
    ): Promise<T> => {
      const store = cacheInstance.store;
      return coalesceAsync(key, async () => {
        const value = await store.get<T>(key);
        if (value === undefined) {
          const result = await fn(...fnArgs);
          const cacheTTL = typeof ttl === 'function' ? ttl(result) : ttl;
          await store.set(key, result, cacheTTL);
          return result;
        } else if (cachingArgs?.refreshThreshold) {
          const cacheTTL = typeof ttl === 'function' ? ttl(value) : ttl;
          const remainingTtl = await store.ttl(key);
          if (
            remainingTtl !== -1 &&
            remainingTtl < cachingArgs.refreshThreshold
          ) {
            fn(...fnArgs).then(result => store.set(key, result, cacheTTL));
          }
        }
        return value;
      });
    };

    return cacheInstance;
  }

  public wrapMultiCaching(
    cacheInstance: MidwayMultiCache,
    caches: MidwayCache[]
  ): MidwayMultiCache {
    if (cacheInstance.methodWrap) {
      return cacheInstance;
    }

    cacheInstance.methodWrap = async <T>(
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
        await cacheInstance.set(key, result, cacheTTL);
        return result;
      } else {
        const cacheTTL = typeof ttl === 'function' ? ttl(value) : ttl;
        Promise.all(
          caches.slice(0, i).map(cache => cache.set(key, value, cacheTTL))
        ).then();
        caches[i].methodWrap(key, fn, fnArgs, ttl).then(); // call wrap for store for internal refreshThreshold logic, see: src/caching.ts caching.wrap
      }
      return value;
    };

    return cacheInstance;
  }

  getName(): string {
    return 'cache-manager';
  }

  public getCaching(cacheKey: string): MidwayCache {
    return this.get(cacheKey);
  }

  public getMultiCaching(cacheKey: string): MidwayMultiCache {
    return this.get(cacheKey);
  }
}
