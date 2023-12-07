import {
  Config,
  Init,
  Inject,
  MidwayCommonError,
  Provide,
  Scope,
  ScopeEnum,
  ServiceFactory,
} from '@midwayjs/core';
import { Cache, MultiCache, caching, multiCaching, Store } from 'cache-manager';

class Caching<T> implements Store {
  del<T>(...args: any[]): Promise<any> {
    return Promise.resolve(undefined);
  }

  get<T>(...args: any[]): Promise<any> {
    return Promise.resolve(undefined);
  }

  keys<T>(...args: any[]): Promise<any> {
    return Promise.resolve(undefined);
  }

  mget<T>(...args: any[]): Promise<any> {
    return Promise.resolve(undefined);
  }

  mset<T>(...args: any[]): Promise<any> {
    return Promise.resolve(undefined);
  }

  reset<T>(...args: any[]): Promise<any> {
    return Promise.resolve(undefined);
  }

  set<T>(...args: any[]): Promise<any> {
    return Promise.resolve(undefined);
  }

  setex<T>(...args: any[]): Promise<any> {
    return Promise.resolve(undefined);
  }

  ttl<T>(...args: any[]): Promise<any> {
    return Promise.resolve(undefined);
  }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class CachingFactory extends ServiceFactory<Store> {
  @Config('cacheManager')
  cacheManagerConfig;

  @Init()
  async init() {
    await this.initClients(this.cacheManagerConfig);
  }

  protected createClient(config, clientName): Promise<void | Store> | void | Store {
    if (config.cacheType === 'single') {
      return caching({ store: config.store, ...config.options });
    } else if (config.cacheType === 'multi') {
      return multiCaching(config.stores);
    } else {
      throw new MidwayCommonError('cacheType must be single or multi');
    }
  }

  getName(): string {
    return 'cache-manager';
  }
}
