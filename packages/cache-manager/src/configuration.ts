import {
  Configuration,
  ILifeCycle,
  IMidwayContainer,
  Inject,
  JoinPoint,
  MidwayDecoratorService,
  REQUEST_OBJ_CTX_KEY,
  DecoratorManager,
} from '@midwayjs/core';
import { CACHE_DECORATOR_KEY } from './decorator/cacheKey';
import { CachingFactory } from './factory';

export function getClassMethodDefaultCacheKey(target, methodName: string) {
  return (
    target.name +
    '-' +
    DecoratorManager.getProviderUUId(target) +
    '-' +
    methodName
  );
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
            let cacheKey = metadata.cacheKey;
            const cachingInstance = this.cacheService.get(
              metadata.cacheInstanceName
            );

            if (typeof cacheKey === 'function') {
              cacheKey = await cacheKey({
                methodArgs: joinPoint.args,
                ctx: joinPoint.target[REQUEST_OBJ_CTX_KEY],
                target: joinPoint.target,
              });
            }

            if (typeof cacheKey === 'string') {
              return cachingInstance.methodWrap(
                cacheKey,
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
