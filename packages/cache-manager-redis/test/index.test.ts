import * as cacheManager from '@midwayjs/cache-manager';
import * as redis from '@midwayjs/redis';
import { createLightApp, close } from '@midwayjs/mock';
import { createStore } from '../src';
import { CachingFactory } from '@midwayjs/cache-manager';

describe('cache-manager-redis', () => {
  it('should test single caching', async () => {
    const app = await createLightApp('', {
      imports: [
        cacheManager,
        redis,
      ],
      globalConfig: {
        cacheManager: {
          client: {
            store: createStore('default'),
            options: {
              ttl: 10,
            }
          }
        },
        redis: {
          client: {
            port: 6379,
            host: '127.0.0.1',
          }
        }
      },
    });

    const cachingFactory = await app.getApplicationContext().getAsync(CachingFactory);
    const caching = cachingFactory.getCaching('default');
    await caching.set('foo', 'bar', 1000);
    const result = await caching.get('foo');
    expect(result).toEqual('bar');


    try {
      await caching.reset();
    } catch (e) {
      expect(e.message).toMatch('flushdb() is too dangerous');
    }

    await close(app);
  });

  it('should test multi caching', async () => {
    const app = await createLightApp('', {
      imports: [
        redis,
        cacheManager,
      ],
      globalConfig: {
        cacheManager: {
          client: {
            store: [
              {
                store: createStore('default'),
                options: {
                  ttl: 10,
                }
              }
            ]
          }
        },
        redis: {
          client: {
            port: 6379,
            host: '127.0.0.1',
          }
        }
      }
    });


    const cachingFactory = await app.getApplicationContext().getAsync(CachingFactory);
    const caching = cachingFactory.getMultiCaching('default');
    await caching.mset([['foo', 'bar']], 5);

    const result = await caching.mget('foo');
    expect(result).toEqual(['bar']);

    // mdel
    await caching.mdel('foo');
    const result2 = await caching.mget('foo');
    expect(result2).toEqual([undefined]);

    await close(app);
  });
});
