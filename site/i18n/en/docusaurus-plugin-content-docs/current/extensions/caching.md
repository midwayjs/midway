# Caching

Caching is a great and simple technique that helps improve the performance of your application. This component provides cache-related capabilities. You can cache data to different data sources, and you can also create multi-level caches for different scenarios to improve data access speed.

:::tip

Midway provides a module based on [cache-manager v5](https://github.com/node-cache-manager/node-cache-manager) that re-encapsulates the cache component. The original cache module is developed based on v3 and is no longer iterated, such as To view old documentation, please visit [here](/docs/extensions/cache).

:::

Related Information:

| Description                     |      |
| ------------------------------- | ---- |
| Available for standard projects | ✅    |
| Serverless available            | ✅    |
| Available for integration       | ✅    |
| Contains independent main frame | ❌    |
| Contains standalone logs        | ❌    |



## Install

First install the relevant component modules.

```bash
$ npm i @midwayjs/cache-manager@3 --save
```

Or add the following dependencies in `package.json` and reinstall.

```json
{
   "dependencies": {
     "@midwayjs/cache-manager": "^3.0.0",
     // ...
   },
}
```



## Enable component


First, introduce the component and import it in `configuration.ts`:

```typescript
import { Configuration } from '@midwayjs/core';
import * as cacheManager from '@midwayjs/cache-manager';
import { join } from 'path'

@Configuration({
   imports: [
     // ...
     cacheManager,
   ],
   importConfigs: [
     join(__dirname, 'config')
   ]
})
export class MainConfiguration {
}
```

## Use cache



### 1. Configure cache

Before use, you need to configure the location of the cache, such as the built-in memory cache, or introduce the Redis cache. Each cache corresponds to a cache Store.

The following example code configures an in-memory cache named `default`.

```typescript
// src/config/config.default.ts
export default {
   cacheManager: {
     clients: {
       default: {
         store: 'memory',
       },
     },
   }
}
```

In the most commonly used scenario, the cache will contain two parameters. Configure `max` to modify the number of caches, and configure `ttl` to modify the expiration time of the cache, in milliseconds.

```typescript
  // src/config/config.default.ts
export default {
   cacheManager: {
     clients: {
       default: {
         store: 'memory',
         options: {
           max: 100,
           ttl: 10,
         },
       },
     },
   }
}
```

:::tip

* The eviction algorithm used by the memory cache is LRU
* The unit of `ttl` is milliseconds

:::

### 2. Use cache

Instances can be obtained through the service factory decorator, and caches can be obtained and saved through simple `get` and `set` methods.

```typescript
import { InjectClient, Provide } from '@midwayjs/core';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';

@Provide()
export class UserService {

   @InjectClient(CachingFactory, 'default')
   cache: MidwayCache;

   async invoke(name: string, value: string) {
     // Set up cache
     await this.cache.set(name, value);
     // Get cache
     const data = await this.cache.get(name);
     // ...
   }
}

```

Dynamically set `ttl` expiration time.

```typescript
await this.cache.set('key', 'value', 1000);
```

To disable cache expiration, you can set the `ttl` configuration property to 0.

```typescript
await this.cache.set('key', 'value', 0);
```

Delete a single cache.

```typescript
await this.cache.del('key');
```

To clear the entire cache, use the `reset` method.

```typescript
await this.cacheManager.reset();
```

:::danger

Note that clearing the entire cache is very dangerous. If Redis is used as the cache store, the entire Redis data will be cleared.

:::

In addition to decorators, cache instances can also be obtained through the API.

```typescript
import { InjectClient, Provide } from '@midwayjs/core';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';

@Provide()
export class UserService {

   @Inject()
   cachingFactory: CachingFactory;

   async invoke() {
     const caching = await this.cachingFactory.get('default');
     // ...
   }
}
```



### 3. Configure multiple caches

Like other components, the component supports configuring multiple cache instances.

```typescript
// src/config/config.default.ts
export default {
   cacheManager: {
     clients: {
       default: {
         store: 'memory',
       },
       otherCaching: {
         store: 'memory',
       }
     },
   }
}
```

Different cache instances can be injected.

```typescript
import { InjectClient, Provide } from '@midwayjs/core';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';

@Provide()
export class UserService {

   @InjectClient(CachingFactory, 'default')
   cache: MidwayCache;
  
   @InjectClient(CachingFactory, 'otherCaching')
   customCaching: MidwayCache;

}

```



### 4. Configure different Stores

The component is based on [cache-manager](https://github.com/node-cache-manager/node-cache-manager) and can be configured with different cache stores. For example, the most common one can be configured with Redis Store.

If the project has been configured with a 'Redis', you can quickly create a Redis Store by using the built-in 'createRedisStore' method of the component.

```typescript
import { createRedisStore } from '@midwayjs/cache-manager';

// src/config/config.default.ts
export default {
   cacheManager: {
     clients: {
       default: {
         store: createRedisStore('default'),
         options: {
           ttl: 10,
         }
       },
     },
   },
   redis: {
     clients: {
       default: {
         port: 6379,
         host: '127.0.0.1',
       }
     }
   }
}
```

The `createRedisStore` method can pass an already configured redis instance name, and the instance can be reused with the redis component.



### 5. Configure third-party Store

In addition to Redis, users can also choose the Store of Cache-Manager. The list can be found [here](https://github.com/node-cache-manager/node-cache-manager?tab=readme-ov-file#store-engines).

Below is an example of configuring [node-cache-manager-ioredis-yet](https://github.com/node-cache-manager/node-cache-manager-ioredis-yet).

```typescript
// src/config/config.default.ts
import { redisStore } from 'cache-manager-ioredis-yet';

export default {
  cacheManager: {
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
  },
}
```



### 6. Multi-level cache

[cache-manager](https://github.com/node-cache-manager/node-cache-manager) supports aggregating multiple cache stores to achieve multi-level caching.

For example, I can create a multi-level cache to merge multiple cache stores together.

```typescript
// src/config/config.default.ts
import { createRedisStore } from '@midwayjs/cache-manager';
export default {
  cacheManager: {
    clients: {
      memoryCaching: {
        store: 'memory',
      },
      redisCaching: {
        store: createRedisStore('default'),
        options: {
          ttl: 10,
        }
      },
      multiCaching: {
        store: ['memoryCaching', 'redisCaching'],
        options: {
          ttl: 100,
        },
      },
    },
  },
  redis: {
    clients: {
      default: {
        port: 6379,
        host: '127.0.0.1',
      }
    }
  }
}
```

In this way, the cache instance `multiCaching` contains two levels of cache. The cache priority is from top to bottom. When searching, it will first search `memoryCaching`. If the key does not exist in the memory cache, it will continue to search `redisCaching`.



### 7. Use multi-level cache

Similar to ordinary cache, multi-level cache also adds `mset`, `mget` and `mdel` methods in addition to `set`, `get` and `del` methods.

```typescript
import { InjectClient, Provide } from '@midwayjs/core';
import { CachingFactory, MidwayMultiCache } from '@midwayjs/cache-manager';

const userId2 = 456;
const key2 = 'user_' + userId;
const ttl = 5;

@Provide()
export class UserService {

   @InjectClient(CachingFactory, 'multiCaching')
   multiCache: MidwayMultiCache;

   async invoke() {
     // Set to all levels of caching
     await this.multiCache.set('foo2', 'bar2', ttl);

     // Get the key from the highest priority cache Store
     console.log(await this.multiCache.get('foo2'));
     // >> "bar2"

     // Call the del method of each Store to delete
     await this.multiCache.del('foo2');

     // Set multiple keys in all caches, including multiple key-value pairs
     await this.multiCache.mset(
       [
         ['foo', 'bar'],
         ['foo2', 'bar2'],
       ],
       ttl
     );

     // mget() fetches from highest priority cache.
     // If the first cache does not return all the keys,
     // the next cache is fetched with the keys that were not found.
     // This is done recursively until either:
     // - all have been found
     // - all caches has been fetched
     console.log(await this.multiCache.mget('key', 'key2'));
     // >> ['bar', 'bar2']

     // Call the mdel method of each Store to delete
     await this.multiCache.mdel('foo', 'foo2');
   }
}

```

### 8. Automatic refresh

Whether it is a normal cache or a multi-level cache, the background refresh function is supported. You only need to configure the `refreshThreshold` time, in milliseconds.

```typescript
// src/config/config.default.ts
export default {
   cacheManager: {
     clients: {
       default: {
         store: 'memory',
         options: {
           refreshThreshold: 3 * 1000,
         },
       },
     },
   }
}
```

If `refreshthreshold` is set, each time the value is obtained from the cache, the value of `ttl` will be checked. If the remaining `ttl` is less than `refreshthreshold`, the system will update the cache asynchronously and the system will return the old value until` ttl` Expired.

:::tip

* In case of multi-level cache, the store that will be checked for refresh is the one where the key will be found first (highest priority).

* If the threshold is low and the worker function is slow, the key may expire and you may encounter a racing condition with updating values.
* The background refresh mechanism currently does not support providing multiple keys.
* If no `ttl` is set for the key, the refresh mechanism will not be triggered. For redis, the `ttl` is set to -1 by default.

:::



## Automatic caching

### Use decorator cache methods

You can cache the results of methods through the `@Caching` decorator, such as caching the results of http responses or service calls.

```typescript
import { Provide } from '@midwayjs/core';
import { Caching } from '@midwayjs/cache-manager';

@Provide()
export class UserService {
   @Caching('default')
   async getUser(name: string) {
     return name;
   }
}

```

When the `getUser` method is called for the first time, the logic will be executed normally and the result will be returned. The decorator will cache the result. When it is executed for the second time, if the cache is not invalidated, it will be returned directly from the cache.

### Specify cached ttl

`ttl` can also be set individually.

```typescript
import { Provide } from '@midwayjs/core';
import { Caching } from '@midwayjs/cache-manager';

@Provide()
export class UserService {
   @Caching('default', 100)
   async getUser(name: string) {
     return name;
   }
}
```

### Manually specify cache key

If you are not satisfied with the automatically generated key, you can manually specify the cached key.

```typescript
import { Provide } from '@midwayjs/core';
import { Caching } from '@midwayjs/cache-manager';

@Provide()
export class UserService {
   @Caching('default', 'customKey', 100)
   async getUser(name: string) {
     return name;
   }
}
```

### Cache with logic

If you want to cache based on some specific logic, such as specific parameters or specific headers, you can pass a tool function for logical judgment.

```typescript
import { Provide } from '@midwayjs/core';
import { Caching } from '@midwayjs/cache-manager';

function cacheBy({methodArgs, ctx, target}) {
   if (methodArgs[0] === 'harry' || methodArgs[0] === 'mike') {
     return 'cache1';
   }
}

@Provide()
export class UserService {
   @Caching('default', cacheBy, 100)
   async getUser(name: string) {
     return 'hello ' + name;
   }
}
```

In the above example, the `cacheBy` method customizes the caching logic. When the method input parameter value is `harry` or `mike`, the cached `key` will be returned, while for other parameters, the cache will be skipped.

The result of execution at this time is:

```typescript
await userService.getUser('harry')); // hello harry
await userService.getUser('mike')); // hello harry
await userService.getUser('lucy')); // hello lucy
```

The `@Caching` decorator can pass a method in the second parameter. The input parameter options of this method are:

* `methodArgs` The actual parameters of the currently called method
* `ctx` If it is a request scope, it is the context object of the current call. If it is a singleton, the object is an empty object.
* `target` The currently called instance

The return value of the method is a string or a Boolean value. When a string is returned, it means that the result of the method is cached with the key. When `undefined` or `null` is returned, it means that the cache is skipped.

By judging these parameters, we can implement very flexible custom caching logic.



## Common problem



### 1. Memory cache set and get cannot obtain the same value under multi-process

This is a normal phenomenon, the data of each process is independent and is only saved in the current process. If you need cross-process caching, use a distributed cache system like Redis.
