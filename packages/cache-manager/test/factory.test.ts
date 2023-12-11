import { CachingFactory } from '../src/factory';
import { sleep } from '@midwayjs/core';
import { redisStore } from 'cache-manager-ioredis-yet';

describe('CachingFactory', () => {
  it('should correctly initialize clients', async () => {
    const factory = new CachingFactory();
    await factory['init']();
    expect(factory['clients'].size).toBe(0);
  });

  it('should correctly create a client', async () => {
    const factory = new CachingFactory();
    factory['cacheManagerConfig'] = {
      clients: {
        test: {
          store: 'memory',
        },
      },
    }
    await factory['init']();
    expect(factory['clients'].size).toBe(1);
    const caching = factory.getCaching('test');
    expect(caching).toBeDefined();
    expect(caching.methodWrap).toBeDefined();
    expect(factory.getName()).toBe('cache-manager');
  });

  it('should correctly create a multi client', async () => {
    const factory = new CachingFactory();
    factory['cacheManagerConfig'] = {
      clients: {
        default: {
          store: 'memory',
        },
        test: {
          store: [
            'default',
            {
              store: 'memory',
            },
          ],
        },
      },
    }
    await factory['init']();
    expect(factory['clients'].size).toBe(2);
    const caching = factory.getMultiCaching('test');
    expect(caching).toBeDefined();
    expect(caching.methodWrap).toBeDefined();

    let result = await caching.methodWrap('key', async () => {
      return 1;
    }, [], 10);
    expect(result).toBe(1);
    result = await caching.methodWrap('key', async () => {
      return 2;
    }, [], 10);
    expect(result).toBe(1);
  });

  it('should correctly create a client with ttl function', async () => {
    const factory = new CachingFactory();
    factory['cacheManagerConfig'] = {
      clients: {
        default: {
          store: 'memory',
        },
      },
    };

    await factory['init']();
    expect(factory['clients'].size).toBe(1);

    const caching = factory.getCaching('default');
    expect(caching).toBeDefined();
    expect(caching.methodWrap).toBeDefined();

    let result = await caching.methodWrap('key', async () => {
      return 1;
    }, [], () => 10);
    expect(result).toBe(1);
    result = await caching.methodWrap('key', async () => {
      return 2;
    }, [], () => 10);
    expect(result).toBe(1);

    await sleep(20);

    result = await caching.methodWrap('key', async () => {
      return 3;
    }, [], () => 100);
    expect(result).toBe(3);

    result = await caching.methodWrap('key', async () => {
      return 4;
    }, [], () => 1);
    expect(result).toBe(3);

    result = await caching.methodWrap('key', async () => {
      return 5;
    }, [], () => 1);
    expect(result).toBe(3);

    result = await caching.methodWrap('key1', async () => {
      return 5;
    }, [], () => 1);
    expect(result).toBe(5);
  });

  it('should correctly create a client with refreshThreshold', async () => {
    const factory = new CachingFactory();
    factory['cacheManagerConfig'] = {
      clients: {
        default: {
          store: 'memory',
          options: {
            refreshThreshold: 50,
            ttl: 100,
          },
        },
      },
    };

    await factory['init']();
    expect(factory['clients'].size).toBe(1);

    const caching = factory.getCaching('default');
    expect(caching).toBeDefined();
    expect(caching.methodWrap).toBeDefined();

    let result = await caching.methodWrap('key', async (v) => {
      return v;
    }, [1]);
    expect(result).toBe(1);

    result = await caching.methodWrap('key', async (v) => {
      return v;
    }, [2]);
    expect(result).toBe(1);

    await sleep(60);

    // 这里是后台刷新，所以拿到的还是 1
    result = await caching.methodWrap('key', async (v) => {
      return v;
    }, [3]);
    expect(result).toBe(1);

    // 这里拿到的是上一次刷新的结果
    result = await caching.methodWrap('key', async (v) => {
      return v;
    }, [4]);
    expect(result).toBe(3);
  });

  it('should correctly create a client with refreshThreshold and ttl function', async () => {
    const factory = new CachingFactory();
    factory['cacheManagerConfig'] = {
      clients: {
        default: {
          store: 'memory',
          options: {
            ttl: 100,
          },
        },
      },
    };

    await factory['init']();
    expect(factory['clients'].size).toBe(1);

    const caching = factory.getCaching('default');
    expect(caching).toBeDefined();
    expect(caching.methodWrap).toBeDefined();

    let result = await caching.methodWrap('key', async (v) => {
      return v;
    }, [1], () => 10);
    expect(result).toBe(1);

    await sleep(20);

    // 这里上一个设置的过期了，所以重新设置生效了
    result = await caching.methodWrap('key', async (v) => {
      return v;
    }, [2], () => 100);
    expect(result).toBe(2);

    await sleep(60);

    // 因为值还是缓存着，没有拿到最新的值, ttl 设置没生效
    result = await caching.methodWrap('key', async (v) => {
      return v;
    }, [3], () => 10);
    expect(result).toBe(2);
  });

  it('should test multi with not defined client', async () => {
    const factory = new CachingFactory();
    factory['cacheManagerConfig'] = {
      clients: {
        test: {
          store: [
            'default',
          ]
        },
      },
    };

    let error;
    try {
      await factory['init']();
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.message).toBe('cache instance "default" not found in "test", please check your configuration.');
  });

  it('should test redis store and close it', async () => {
    const factory = new CachingFactory();
    factory['cacheManagerConfig'] = {
      clients: {
        default: {
          store: redisStore,
          options: {
            port: 6379,
            host: 'localhost',
            ttl: 10,
          },
        },
      },
    };

    await factory['init']();
    expect(factory['clients'].size).toBe(1);

    const caching = factory.getCaching('default');
    expect(caching).toBeDefined();

    // get/set
    await caching.set('key', 'value');
    let result = await caching.get('key');
    expect(result).toBe('value');

    // ttl
    await sleep(20);
    result = await caching.get('key');
    expect(result).toBeUndefined();

    await (caching.store as any).client.quit();
  });

});
