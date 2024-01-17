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
import { caching, multiCaching } from './base';
import {
  CacheManagerOptions,
  MidwayCache,
  MidwayMultiCache,
  MidwayUnionCache,
} from './interface';

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
    // multi cache
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
              storeConfig['options'] || {},
              this.applicationContext
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
      return await multiCaching(newFactory);
    } else {
      // single cache
      if (typeof config.store === 'function') {
        config.store = await config.store(
          config['options'] || {},
          this.applicationContext
        );
      }
      if (!config.store) {
        throw new MidwayCommonError(
          `cache instance "${clientName}" store is undefined, please check your configuration.`
        );
      }
      return await caching(config.store, config['options']);
    }
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
