import { createCustomMethodDecorator, IMidwayContext } from '@midwayjs/core';

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
  cacheKey: CachingDecoratorKeyOptions,
  ttl?: number
) {
  return createCustomMethodDecorator(CACHE_DECORATOR_KEY, {
    cacheInstanceName,
    cacheKey,
    ttl,
  });
}
