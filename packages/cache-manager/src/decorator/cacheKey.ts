import { DecoratorManager, IMidwayContext } from '@midwayjs/core';

export const CACHE_DECORATOR_KEY = 'cache-manager:caching';
export type CachingDecoratorKeyOptions =
  | string
  | ((options: {
      methodArgs: any[];
      ctx?: IMidwayContext;
      target: any;
    }) => string);

export function Caching(
  cacheInstanceName: string,
  cacheKeyOrTTL?: CachingDecoratorKeyOptions | number,
  ttl?: number
) {
  if (typeof cacheKeyOrTTL === 'number') {
    ttl = cacheKeyOrTTL;
    cacheKeyOrTTL = undefined;
  }
  return DecoratorManager.createCustomMethodDecorator(CACHE_DECORATOR_KEY, {
    cacheInstanceName,
    cacheKey: cacheKeyOrTTL,
    ttl,
  });
}
