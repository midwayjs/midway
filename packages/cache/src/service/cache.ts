import { Config, Init, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import * as cacheManager from 'cache-manager';

@Scope(ScopeEnum.Singleton)
@Provide()
export class CacheManager {
  cache: cacheManager.Cache;

  @Config('cache')
  cacheConfig;

  @Init()
  async init() {
    this.cache = cacheManager.caching({
      store: this.cacheConfig.store,
      ...this.cacheConfig.options,
    });
  }

  // 获取key
  async get<T>(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.cache.get<T>(key, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }

  // 设置cache
  async set<T>(key: string, value: T, options?: cacheManager.CachingConfig): Promise<T> {
    return await this.cache.set(key, value, options);
  }

  // 删除key
  async del(key: string) {
    return await this.cache.del(key);
  }

  // 清空cache
  async reset() {
    return await this.cache.reset();
  }
}
