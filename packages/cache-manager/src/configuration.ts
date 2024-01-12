import {
  Configuration,
  getProviderUUId,
  ILifeCycle,
  IMidwayContainer,
  Inject,
  JoinPoint,
  MidwayDecoratorService,
  REQUEST_OBJ_CTX_KEY,
} from '@midwayjs/core';
import { CACHE_DECORATOR_KEY } from './decorator/cacheKey';
import { CachingFactory } from './factory';

export function getClassMethodDefaultCacheKey(target, methodName: string) {
  return target.name + '-' + getProviderUUId(target) + '-' + methodName;
}

@Configuration({
  namespace: 'cacheManager',
  importConfigs: [
    {
      default: {
        cacheManager: {},
      },
    },
  ],
})
export class CacheConfiguration implements ILifeCycle {
  @Inject()
  decoratorService: MidwayDecoratorService;

  cacheService: CachingFactory;

  async onReady(container: IMidwayContainer) {
    // init factory and caching instance
    this.cacheService = await container.getAsync(CachingFactory);
    // register @Caching decorator implementation
    this.decoratorService.registerMethodHandler(
      CACHE_DECORATOR_KEY,
      ({ target, propertyName, metadata }) => {
        if (!metadata.cacheKey) {
          metadata.cacheKey = getClassMethodDefaultCacheKey(
            target,
            propertyName
          );
        }

        return {
          around: async (joinPoint: JoinPoint) => {
            const cachingInstance = this.cacheService.get(
              metadata.cacheInstanceName
            );

            if (typeof metadata.cacheKey === 'function') {
              metadata.cacheKey = await metadata.cacheKey({
                methodArgs: joinPoint.args,
                ctx: joinPoint.target[REQUEST_OBJ_CTX_KEY],
                target: joinPoint.target,
              });
            }

            if (typeof metadata.cacheKey === 'string') {
              return cachingInstance.methodWrap(
                metadata.cacheKey,
                joinPoint.proceed,
                joinPoint.args,
                metadata.ttl
              );
            } else {
              return joinPoint.proceed(...joinPoint.args);
            }
          },
        };
      }
    );
  }
}
