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
  Inject,
  MidwayTraceService,
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

  @Inject()
  protected traceService: MidwayTraceService;

  @Config('cacheManager.tracing.meta')
  protected traceMetaResolver;

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
      const cache = await multiCaching(newFactory);
      this.bindTraceContext(cache, clientName);
      return cache;
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
      const cache = await caching(config.store, config['options']);
      this.bindTraceContext(cache, clientName);
      return cache;
    }
  }

  protected bindTraceContext(cache: MidwayUnionCache, clientName: string) {
    if (!cache || !this.traceService) {
      return;
    }

    const wrapMethod = (target: any, methodName: string) => {
      const rawMethod = target?.[methodName];
      if (typeof rawMethod !== 'function') {
        return;
      }

      target[methodName] = (...args) => {
        return this.traceService.runWithExitSpan(
          `cache.${methodName}`,
          {
            carrier: {},
            attributes: {
              'midway.protocol': 'cache',
              'midway.cache.client': clientName,
              'midway.cache.method': methodName,
            },
            meta: this.traceMetaResolver,
            metaArgs: {
              carrier: {},
              request: args,
              custom: {
                clientName,
                methodName,
              },
            },
          },
          async () => {
            return rawMethod.apply(target, args);
          }
        );
      };
    };

    [
      'get',
      'set',
      'del',
      'wrap',
      'methodWrap',
      'mget',
      'mset',
      'mdel',
      'reset',
    ].forEach(methodName => wrapMethod(cache, methodName));
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
